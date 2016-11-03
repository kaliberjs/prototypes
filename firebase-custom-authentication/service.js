const firebase = require('firebase')

const serviceApp = firebase.initializeApp({
  serviceAccount: '../kaliberjs-prototypes-firebase-credentials.json',
  databaseURL: 'https://kaliberjs-prototypes.firebaseio.com',
  databaseAuthVariableOverride: {
    uid: 'custom-auth-service'
  }
}, 'firebase-custom-authentication-service')

serviceApp.database().ref('testCustomAuthentication/request').on('child_added', onRequest)

console.log('Custom authentication service started')

const passwords = ['1234', '5678']
const additionalClaims = { customAuthenticated: true }

function onRequest(snapshot) {
  snapshot.ref.remove()
  const { password, uid } = snapshot.val()
  serviceApp.database()
    .ref('testCustomAuthentication/response/' + snapshot.key)
    .set({ token: passwords.includes(password) ? createTokenFor(uid, additionalClaims) : null, uid })
}

function createTokenFor(uid, additionalClaims) {
  return serviceApp.auth().createCustomToken(uid, additionalClaims)
}
