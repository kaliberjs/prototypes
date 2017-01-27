process.on('unhandledRejection', e => console.error(e))

const admin = require('firebase-admin')
const serviceDescription = require('./service-description.js')
const MasterService = require('./MasterService')

const app = admin.initializeApp({
  databaseURL: 'https://experiment-ce0d3.firebaseio.com',
  credential: admin.credential.cert(require('./firebase-service-account.json'))
}, 'service-app')
const db = app.database()

db.ref().update(serviceDescription)

const masterService = new MasterService({ ref: db.ref('services'), reportError: console.error })

process.on('SIGINT', () => {
  console.log('')
  console.log('Shutdown signal received')
  console.log('Shutting down')

  masterService.shutdown()
    .then(_ => { console.log('Shutdown successful'); process.exit(0) })
    .catch(err => { console.error('Shutdown unsuccessful\n' + err); process.exit(1)})
})
