const firebase = require('firebase')
const Queue = require('firebase-queue')

const service1 = createService({ name: "service1", targetRefName: "testServiceRedundancy" })
const service2 = createService({ name: "service2", targetRefName: "testServiceRedundancy" })

console.log('Services started')

process.on('SIGINT', () => {
  console.log('')
  console.log('Starting shutdown')

  Promise.all([service1.shutdown(), service2.shutdown()])
    .catch(e => { console.error(e) })
    .then(_ => {
      console.log('Finished shutdown')
      process.exit(0)
    })
})

function createService({ name, targetRefName }) {
  const app = createFirebaseApp(name)
  const db = app.database()
  const targetRef = db.ref(targetRefName)
  const tasksRef = targetRef.child("request")
  const specsRef = targetRef.child("specs")
  const responseRef = targetRef.child("response")

  const options = {
    numWorkers: 5,
    sanitize: false
  }

  return new Queue({ tasksRef, specsRef }, options, ({ value, uid, _id }, progress, resolve, reject) => {
    const processedValue = value + ' has been seen by ' + name
    responseRef.child(_id).set({ value: processedValue, uid })
      .then(resolve)
      .catch(reject)
  })
}

function createFirebaseApp(name) {
  return firebase.initializeApp({
    serviceAccount: '../kaliberjs-prototypes-firebase-credentials.json',
    databaseURL: 'https://kaliberjs-prototypes.firebaseio.com',
    databaseAuthVariableOverride: {
      uid: 'custom-redundancy-service'
    }
  }, 'firebase-service-reducundancy-' + name)
}

