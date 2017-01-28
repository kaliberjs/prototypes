const Queue = require('firebase-queue')

module.exports = RequestResponseService

function RequestResponseService({
  ref,
  processValue, // (payload: any, uid: string) => Promise<any>
  reportError,
  queueOptions: { numWorkers = 1, specId = undefined, suppressStack = false } = {}
}) {

  const tasksRef = ref.child('request')
  const specsRef = ref.child('specs')
  const responseRef = ref.child('response')

  const queueOptions = { sanitize: false, numWorkers, specId, suppressStack }

  const queue = new Queue({ tasksRef, specsRef }, queueOptions, handleRequest)

  this.shutdown = () => queue.shutdown()

  function handleRequest({ payload, uid, _id }, progress, resolve, reject) {
    processValue(payload, uid)
      .then(payload => responseRef.child(_id).set({ payload, uid }))
      .then(resolve)
      .catch(x => { reportError(x); reject(x) })
  }
}

RequestResponseService.createRules = function(serviceUid, { additionalRequestValidation = 'true' } = {}) {
  const isService = `(auth.uid === '${serviceUid}')`
  const ownedByCurrentUser = data => `(auth.uid === ${data}.child('uid').val())`

  const baseRules = {
    'request': {
      '.indexOn': '_state',
      '.read': isService,
      '.write': `${isService} || (auth !== null && newData.exists())`,
      '$id': {
        '.validate': `${isService} || (${ownedByCurrentUser('newData')} && ${additionalRequestValidation})`
      }
    },
    'response': {
      '.write': isService,
      '$id': {
        '.read': `!data.exists() || ${ownedByCurrentUser('data')}`,
        '.write': `${ownedByCurrentUser('data')} && !newData.exists()`
      }
    },
    'specs': {
      '.read': isService,
      '.write': isService
    }
  }

  return baseRules
}
