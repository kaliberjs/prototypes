const { TIMESTAMP } = require('firebase-admin').database.ServerValue
const googleClientSecret = require('./google-client-secret')

module.exports = {
  services: [
    { type: 'scheduler', location: 'scheduler' },
    { type: 'transform', location: 'transformer' },
    { type: 'http-json-client', location: 'http/token' }
  ],
  scheduler: [
    {
      type: 'recurring',
      interval: '5s', // https://github.com/zeit/ms
      start: 0,
      push: { location: 'tick', data: JSON.stringify({ at: TIMESTAMP }) }
    }
  ],
  transformer: [
    {
      type: 'transfer',
      source: { location: 'tick' },
      target: { location: 'tickTarget', list: false }
    },
    {
      type: 'sampleCombine',
      sample: { location: 'token/request' },
      sources: [ { location: 'googleTokenRequest', list: false } ],
      target: { location: 'http/token/request', list: true },
      merge: 'mergeObjects'
    },
    {
      type: 'transfer',
      source: { location: 'http/token/response' },
      target: { location: 'token/response', list: true }
    }
  ],
  googleTokenRequest: {
    payload: {
      url: 'https://accounts.google.com/o/oauth2/token',
      options: {
        method: 'POST',
        dataType: 'form-url-encoded',
        body: {
          client_secret: googleClientSecret,
          grant_type: 'authorization_code'
        }
      }
    }
  }
}
