const Service = require('./RequestResponseService')
const requestify = require('requestify')
const locationToRef = require('./locationToRef')

module.exports = HttpJsonClientService

/*
 * {
 *   url: 'http://target.com/api',
 *   options: ... // https://github.com/ranm8/requestify
 * }
 *
 *
 */

HttpJsonClientService.createFromData = (data, reportError) => new HttpJsonClientService({
  ref: locationToRef(data, 'location'),
  reportError,
  queueOptions: data.child('queueOptions').val() || undefined
})

function HttpJsonClientService({
  ref,
  reportError,
  queueOptions
}) {
  Service.call(this, { ref, processValue, reportError, queueOptions })

  function processValue({ url, options }, uid) {
    return requestify.request(url, options)
      .then(r => ({ status: r.code, headers: r.headers, body: r.getBody() }))
  }
}
