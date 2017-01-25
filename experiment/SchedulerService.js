/*
 * This scheduler should only be instantiated once for a given location (ref). This means it can not
 * scale horizonally.
 *
 * A job should have the following format (note that fields with an underscore
 * will be added by the sceduler):
 *
 * {
 *   type: 'recurring',
 *   interval: '1h', // https://github.com/zeit/ms
 *   start: timestamp,
 *   push: {
 *     location: 'some/ref',
 *     data: 'JSON stringified string'
 *   },
 *   _lastRun: timestamp,
 *   _nextRun: timestamp,
 *   _error: 'error message'
 * }
 *
 * {
 *   type: 'single',
 *   at: timestamp,
 *   push: {
 *     location: 'some/ref',
 *     data: 'JSON stringified string'
 *   },
 *   _ran: timestamp,
 *   _error: 'error message'
 * }
 *
 * If you want to be more precise, add the value from the ref '.info/serverTimeOffset' to
 * your timestamps (https://firebase.google.com/docs/database/web/offline-capabilities#clock-skew).
 *
 * Make sure the firebase user for the schedular has access to the locations of the jobs.
 *
 * Data will be run through JSON.parse and pushed to the given location, this allows you to use
 * the contents of firebase.database.ServerValue.TIMESTAMP as a value.
 */
const syncToObject = require('./syncToObject')
const locationToRef = require('./locationToRef')

const ms = require('ms')

const noop = Promise.resolve(null)

module.exports = SchedulerService

SchedulerService.createFromData = (data, reportError) => new SchedulerService({
  ref: locationToRef(data, 'location'),
  options: data.child('options').val(),
  reportError
})

// This can be implemented more efficiently, but that requires more code and should only be
// done once you find yourself in a situation where the performance suffers.
// If you have a lot of `single` jobs, you might consider removing them once `_ran` is set.
function SchedulerService({ ref, reportError, options: { interval = 500 } }) {

  const { root } = ref
  const processors = {
    'recurring': processRecurring,
    'single': processSingle
  }

  const jobs = {}
  const stopSync = syncToObject(ref, jobs)

  let serverOffset = 0
  let currentRun = syncServerOffset().then(_ => processJobs() )

  let timeoutId = null

  this.shutdown = () => {
    stopSync()
    // theorically we might have timing issues, hence the double `clearTimeout`
    clearTimeout(timeoutId)
    return currentRun.then(_ => clearTimeout(timeoutId))
  }

  function processJobs() {
    return Promise.all(asArray(jobs).map(processJob).map(p => p.catch(reportError)))
      .then(_ => { scheduleNextRun() })
  }

  function scheduleNextRun() {
    timeoutId = setTimeout(run, interval)

    function run() {
      currentRun = processJobs()
    }
  }

  function processJob(data) {
    if (data.hasChild('_error')) return noop

    const jobType = data.child('type').val()
    const processor = processors[jobType]

    if (processor) return processor(data)
    else return setError(data, `Unknown job type '${jobType}'`)
  }

  function processSingle(data) {
    if (data.hasChild('_ran')) return noop

    const time = getServerTime()

    if (data.child('at').val() > time) return noop

    const push = data.child('push').val()
    const update = {
      [getPath(data.ref) + '/_ran']: time,
      [getChildPath(push.location)]: JSON.parse(push.data)
    }

    return root.update(update).catch(e => setError(data, e.message))
  }

  function processRecurring(data) {
    if (!data.hasChild('_nextRun')) return data.ref
      .update({ '_nextRun': data.child('start').val() })
      .then(_ => data.ref.once('value'))
      .then(processRecurring)

    const time = getServerTime()
    const nextRun = data.child('_nextRun').val()

    if (nextRun > time) return noop

    const path = getPath(data.ref)
    const push = data.child('push').val()
    const update = {
      [path + '/_lastRun']: time,
      [path + '/_nextRun']: nextRun + ms(data.child('interval').val()),
      [getChildPath(push.location)]: JSON.parse(push.data)
    }
    return root.update(update).catch(e => setError(data, e.message))
  }

  function syncServerOffset() {
    ref.root.child('.info/serverTimeOffset').once('value')
      .then(data => {
        serverOffset = data.val()
        data.ref.on('value', data => { serverOffset = data.val() })
      })
  }

  function getChildPath(location) {
    return location + '/' + root.child(location).push().key
  }

  function setError(data, error) {
    return data.ref.update({ '_error': error })
  }

  function getPath(ref) {
    return prependParent(ref.parent, ref.key)

    function prependParent(ref, path) {
      return ref ? withParent(ref.parent, ref.key + '/' + path) : path
    }
  }

  function getServerTime() {
    return Date.now() + serverOffset
  }

  function asArray(o) {
    // since there is time between getting the keys and obtaining the values
    // we need to filter out the ones that were deleted
    return Object.keys(o).map(k => o[k]).filter(Boolean)
  }
}

