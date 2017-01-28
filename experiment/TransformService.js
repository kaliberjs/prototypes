/**
 *
 * {
 *   type: 'transfer',
 *   source: {
 *     location: 'source/location',
 *     queueOptions: {} // see firebase-queue
 *   },
 *   target: {
 *     location: 'source/location',
 *     list: true
 *   }
 * }
 *
 * {
 *   type: 'sampleCombine',
 *   sample: {
 *     location: 'source/location',
 *     queueOptions: {} // see firebase-queue
 *   },
 *   sources: [
 *     {
 *       location: 'source/location',
 *       list: false
 *     },
 *     ...
 *   ],
 *   target: {
 *     location: 'source/location',
 *     list: true
 *   },
 *   merge: 'mergeObjects'
 * }
 *
 *
 */
const Queue = require('firebase-queue')
const { Stream } = require('xstream')
const sampleCombine = require('xstream/extra/sampleCombine').default
const ServiceFactory = require('./ServiceFactory')
const locationToRef = require('./locationToRef')

module.exports = TransformService

TransformService.SampleCombine = SampleCombine
TransformService.Transfer = Transfer
TransformService.createFromData = (data, reportError) => new TransformService({
  ref: locationToRef(data, 'location'),
  reportError
})

function TransformService({ ref, reportError }) {

  const constructors = {
    transfer: Transfer.createFromData,
    sampleCombine: SampleCombine.createFromData
  }

  ServiceFactory.call(this, { ref, reportError, constructors })
}

Transfer.createFromData = (data, reportError) => new Transfer({
  source: { ref: locationToRef(data, 'source/location'), queueOptions: data.child('source/queueOptions').val() || undefined },
  target: { ref: locationToRef(data, 'target/location'), list: data.child('target/list').val() },
  reportError
})

function Transfer({
  source: { ref: sourceRef, queueOptions = {} }, // this currently only works with list style, some research is needed for
                                                 // object style (`value` event) if we want to scale horizontally
  target: { ref: targetRef, list = true },
  reportError
}) {
  // we don't want any custom specs, if we want to support specs, a specsref needs to be passed in
  delete queueOptions.specId

  const options = Object.assign({}, queueOptions, { sanitize: false })

  const queue = new Queue({ tasksRef: sourceRef, specsRef: null }, options, handleRequest)

  this.shutdown = () => queue.shutdown()

  function handleRequest(data, progress, resolve, reject) {
    (list ? targetRef.child(data._id).set(data) : targetRef.set(data))
      .then(resolve)
      .catch(x => { reportError(x); reject(x) })
  }
}

//--1----2-----3--------4--- sample
//----a-----b-----c--d------ source
//     sampleCombine         merge = ([a, b]) => '' + a + b
//-------2a----3b-------4d-- target
SampleCombine.createFromData = (data, reportError) => {
  const mergeFunctions = {
    mergeObjects
  }

  return new SampleCombine({
    sample: { ref: locationToRef(data, 'sample/location'), queueOptions: data.child('sample/queueOptions').val() || undefined },
    sources: data.child('sources').val().map(({ location, list }) => ({ ref: data.ref.root.child(location), list })),
    target: { ref: locationToRef(data, 'target/location'), list: data.child('target/list').val() },
    merge: mergeFunctions[data.child('merge').val()] || (x => x),
    reportError
  })

  function mergeObjects(objects) {
    return objects.reduce((result, obj) => merge(result, obj), {})
  }

  function merge(obj1, obj2) {
    return Object.keys(obj2).reduce((result, key) => {
      const oldValue = result[key]
      const newValue = obj2[key]
      if (isObject(oldValue) && isObject(newValue)) result[key] = merge(oldValue, newValue)
      else if (newValue !== undefined) result[key] = newValue

      return result
    }, obj1)
  }

  function isObject(value) {
    return value && !Object.getPrototypeOf(Object.getPrototypeOf(value))
  }
}

function SampleCombine({
  sample,  // { ref: sampleRef, queueOptions = {} },
  sources, // [{ ref, list = false }]
  target: { ref, list = true },
  merge, // ([sample, source0, ..., sourceN]) => target
  reportError
}) {
  if (!sample.queueOptions) sample.queueOptions = {}
  // we don't want any custom specs, if we want to support specs, a specsref needs to be passed in
  delete sample.queueOptions.specId

  const { stream: sampleStream, shutdown: sampleShutdown } = refToQueueToStream(sample)
  const [sourceStreams, sourceShutdowns] = sources
    .map(refToStream)
    .reduce(([streams, shutdowns], { stream, shutdown }) => [[...streams, stream], [...shutdowns, shutdown]], [[], []])

  sampleStream
    .compose(sampleCombine(...sourceStreams))
    .map(merge)
    .addListener({
      next: data => { list ? ref.push(data) : ref.set(data) },
      error: reportError
    })

  this.shutdown = () => sampleShutdown().then(_ => Promise.all(sourceShutdowns.map(shutdown => shutdown())))

  function refToQueueToStream({ ref, queueOptions = {} }) {
    let queue = null

    return {
      stream: createStream(listener => {
        queue = new Queue({ tasksRef: ref, specsRef: null }, queueOptions, (data, progress, resolve, reject) => {
          listener.next(data)
          resolve()
        })
      }),
      shutdown: () => Promise.resolve(queue && queue.shutdown())
    }
  }

  function refToStream({ ref, list = false }) {

    const [actualRef, eventType] = list
      ? [ref.limitToLast(1), 'child_added']
      : [ref, 'value']

    let handler = null

    return {
      stream: createStream(listener => {
        handler = actualRef.on(eventType, data => { listener.next(data.val()) })
      }),
      shutdown: () => Promise.resolve(handler && actualRef.off(eventType, handler))
    }
  }

  function createStream(produce) {
    return Stream.create({
      start: produce,
      stop: () => {} // we don't need to implement stop because we always have a listener
    })
  }
}
