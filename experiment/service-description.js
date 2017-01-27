const { TIMESTAMP } = require('firebase-admin').database.ServerValue

module.exports = {
  services: [
    {
      type: 'scheduler',
      location: 'scheduler'
    },
    {
      type: 'transform',
      location: 'transformer'
    }
  ],
  scheduler: [
    {
      type: 'recurring',
      interval: '5s', // https://github.com/zeit/ms
      start: 0,
      push: {
        location: 'tick',
        data: JSON.stringify({ at: TIMESTAMP })
      }
    }
  ],
  transformer: [
    {
      type: 'transfer',
      source: {
        location: 'tick',
      },
      target: {
        location: 'tickTarget',
        list: false
      }
    }
  ]
}
