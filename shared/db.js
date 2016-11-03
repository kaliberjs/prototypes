function FirebaseApp(appId = pathBasedAppId()) {

  const app = firebase.initializeApp({
    apiKey: "AIzaSyBKedos9ktYW5yHW15txGZsqwF0vwVcX3E",
    databaseURL: 'https://kaliberjs-prototypes.firebaseio.com'
  }, appId)

  this.authenticateAnonymously = authenticateAnonymously
  this.authenticateWithEmailAndPassword = authenticateWithEmailAndPassword
  this.authenticateWithToken = authenticateWithToken
  this.app = app
  this.db = app.database()

  const auth = app.auth()

  function authenticate({ isCorrect, signin, messages: {
    authenticated, incorrect, authenticating
  }}) {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        user
          ? (
            isCorrect(user)
              ? (console.log(authenticated(user)), unsubscribe(), resolve(user))
              : (console.log(incorrect), auth.signOut())
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
        incorrect: 'Existing authentication is not anonymous, signing out',
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
        incorrect: 'Existing authentication is not authenticated using password, signing out',
        authenticating: 'Authenticating with email and password'
      }
    })
  }

function authenticateWithToken(token) {
    return authenticate({
      isCorrect: _ => false,
      signin: auth => auth.signInWithCustomToken(token),
      messages: {
        authenticated: _ => 'Athenticated customly',
        incorrect: 'Can not determine if the current user is signed in with custom token, signing out',
        authenticating: 'Authenticating with token'
      }
    })
  }
}

function pathBasedAppId() {
  const [appId] = document.location.href.split('?')
  return appId
}

