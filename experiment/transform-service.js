const { Stream } = require('xstream')
const sampleCombine = require('xstream/extra/sampleCombine')

module.exports = {
  SampleCombine
}

//--1----2-----3--------4--- sample
//----a-----b-----c--d------ source
//     sampleCombine         merge = ([a, b]) => '' + a + b
//-------2a----3b-------4d-- target
function SampleCombine({
  sample,  // { ref: sampleRef, queueOptions = {} },
  sources, // [{ ref, list = false }]
  target: { ref, list = true },
  merge // ([sample, source0, ..., sourceN]) => target
}) {

  const sourceStreams = sourceRefs.map(refToStream)

  refToQueueToStream(sample)
    .compose(sampleCombine(...sourceStreams))
    .map(merge)
    .addListener({ next: data => { if (list) ref.push(data) else ref.set(data) } })

  function refToQueueToStream({ ref, queueOptions = {} }) {
    // we don't want any custom specs, if we want to support specs, a specsref needs to be passed in
    delete queueOptions.specId

    return createStream(listener => {
      new Queue({ tasksRef: ref, specsRef: null }, queueOptions, (data, progress, resolve, reject) => {
        listener.next(data)
        resolve()
      })
    })
  }

  function refToStream({ ref, list = false }) {

    const [actualRef, eventType] = list
      ? [ref.limitToLast(1), 'child_added']
      : [ref, 'value']

    return createStream(listener => {
      actualRef.on(eventType, data => { listener.next(data.val()) }
    })
  }

  function createStream(produce) {
    return Stream.create({
      start: produce,
      stop: () => {} // we don't need to implement stop because we always have a listener
    })
  }
}
