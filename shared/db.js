firebase.initializeApp({
  apiKey: "AIzaSyBKedos9ktYW5yHW15txGZsqwF0vwVcX3E",
  databaseURL: 'https://kaliberjs-prototypes.firebaseio.com'
})

const auth = firebase.auth()
auth.onAuthStateChanged(authenticate)

const db = firebase.database()

function authenticate(user) {
  if (user) {
    console.log('Authenticated: ' + (user.isAnonymous ? 'anonymous' : user.email))
  } else {
    if (configuration.email && configuration.password) {
      console.log('Authenticating using email and password')
      auth.signInWithEmailAndPassword(configuration.email, configuration.password)
    } else {
      console.log('Authenticating anonymously')
      auth.signInAnonymously()
    }
  }
}
