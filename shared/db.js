firebase.initializeApp({
  apiKey: "AIzaSyBKedos9ktYW5yHW15txGZsqwF0vwVcX3E",
  databaseURL: 'https://kaliberjs-prototypes.firebaseio.com'
})
firebase.auth().signInWithEmailAndPassword(configuration.email, configuration.password)
const db = firebase.database()
