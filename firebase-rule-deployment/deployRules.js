const http = require('https')
const url = require('url')
const admin = require('firebase-admin')

const rules = require('./testRules')

admin.credential.cert(require('../kaliberjs-prototypes-firebase-credentials'))
  .getAccessToken()
  .then(({ access_token }) => {
    const endpoint = 'https://kaliberjs-prototypes.firebaseio.com/.settings/rules.json?access_token=' + access_token

    console.log('Sending rules to ' + endpoint)
    //for debugging purposes:
    //console.log('Rules:')
    //console.log(rules)

    const req = http.request(
      Object.assign({ method: 'PUT' }, url.parse(endpoint)),
      response => { console.log(`Done.\nStatus code: ${response.statusCode}`) }
    )

    req.write(rules)
    req.end()
  })


