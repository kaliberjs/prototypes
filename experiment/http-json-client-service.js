const Service = require('request-response-service')
const requestify = require('requestify')

/*
 * {
 *   url: 'http://target.com/api',
 *   options: ... // https://github.com/ranm8/requestify
 * }
 *
 *
 */

function HttpJsonClientService({
  ref,
  reportError,
  queueOptions: { numWorkers = 1, specId = null, suppressStack = false } = {}
}) {
  Service.call(this, { ref, processValue, reportError, queueOptions })

  function processValue({ url, options }, uid) {
    return requestify.request(url, options)
  }
}
