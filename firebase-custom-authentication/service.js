const firebase = require('firebase')
const crypto = require('crypto')

const serviceApp = firebase.initializeApp({
  serviceAccount: '../kaliberjs-prototypes-firebase-credentials.json',
  databaseURL: 'https://kaliberjs-prototypes.firebaseio.com',
  databaseAuthVariableOverride: {
    uid: 'custom-auth-service'
  }
}, 'firebase-custom-authentication-service')

const db = serviceApp.database()
db.ref('testCustomAuthentication/request').on('child_added', onRequest)

const uids = db.ref('testCustomAuthentication/uids')

console.log('Custom authentication service started')

const passwords = ['1234', '5678']
const additionalClaims = { customAuthenticated: true }

function onRequest(snapshot) {
  snapshot.ref.remove()
  const { password, uid } = snapshot.val()
  getTokenUid(hash(password), uid)
    .then(tokenUid => {
      db
        .ref('testCustomAuthentication/response/' + snapshot.key)
        .set({ token: passwords.includes(password) ? createTokenFor(tokenUid, additionalClaims) : null, uid })
    })
}

function getTokenUid(inputHash, uid) {
  const location = uids.child(inputHash)
  return location.once('value').then(snapshot =>
    snapshot.exists()
      ? snapshot.val()
      : location.set(uid).then(_ => uid)
  )
}

function createTokenFor(uid, additionalClaims) {
  return serviceApp.auth().createCustomToken(uid, additionalClaims)
}

function hash(data) {
  return crypto.createHash('md5').update(data).digest("hex")
}
