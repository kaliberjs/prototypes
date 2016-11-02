const app = initializeApp()
const db = app.database()
const auth = app.auth()

function initializeApp({ appId = pathBasedAppId(), config = configuration } = {}) {
  console.log('Initializing ' + appId)
  const app = firebase.initializeApp({
    apiKey: "AIzaSyBKedos9ktYW5yHW15txGZsqwF0vwVcX3E",
    databaseURL: 'https://kaliberjs-prototypes.firebaseio.com'
  }, appId)
  const auth = app.auth()
  auth.onAuthStateChanged(authenticate)

  return app

  function authenticate(user) {
    if (user) {
      console.log('Authenticated: ' + (user.isAnonymous ? 'anonymous' : user.email))
    } else {
      if (config.email && config.password) {
        console.log('Authenticating using email and password')
        auth.signInWithEmailAndPassword(config.email, config.password)
      } else {
        console.log('Authenticating anonymously')
        auth.signInAnonymously()
      }
    }
  }
}

function pathBasedAppId() {
  const [appId] = document.location.href.split('?')
  return appId
}

