function FirebaseApp(appId = pathBasedAppId()) {

  const app = firebase.initializeApp({
    apiKey: "AIzaSyBKedos9ktYW5yHW15txGZsqwF0vwVcX3E",
    databaseURL: 'https://kaliberjs-prototypes.firebaseio.com'
  }, appId)

  this.authenticateAnonymously = authenticateAnonymously
  this.authenticateWithEmailAndPassword = authenticateWithEmailAndPassword
  this.app = app
  this.db = app.database()

  const auth = app.auth()

  function authenticate({ isCorrect, signin, messages: {
    authenticated, incorrectProviderId, authenticating
  }}) {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        user
          ? (
            isCorrect(user)
              ? (console.log(authenticated(user)), unsubscribe(), resolve(user))
              : (console.log(incorrectProviderId), auth.signOut())
          )
          : (console.log(authenticating), unsubscribe(), resolve(signin(auth)))
        }
      )
    })
  }

  function authenticateAnonymously() {
    return authenticate({
      isCorrect: user => user.isAnonymous,
      signin: auth => auth.signInAnonymously(),
      messages: {
        authenticated: _ => 'Athenticated anonymously',
        incorrectProviderId: 'Existing authentication is not anonymous, signing out',
        authenticating: 'Authenticating anonymously'
      }
    })
  }

  function authenticateWithEmailAndPassword({ email, password }) {
    return authenticate({
      isCorrect: ({ providerData: [ { providerId } ] }) => providerId === 'password',
      signin: auth => auth.signInWithEmailAndPassword(email, password),
      messages: {
        authenticated: user => 'Athenticated as ' + user.email,
        incorrectProviderId: 'Existing authentication is not authenticated using password, signing out',
        authenticating: 'Authenticating with email and password'
      }
    })
  }
}

function pathBasedAppId() {
  const [appId] = document.location.href.split('?')
  return appId
}

