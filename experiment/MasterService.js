const HttpJsonClientService = require('./HttpJsonClientService')
const TransformService = require('./TransformService')
const SchedulerService = require('./SchedulerService')
const ServiceFactory = require('./ServiceFactory')

module.exports = MasterService

function MasterService({ ref, reportError }) {

  const constructors = {
    'http-json-client': HttpJsonClientService.createFromData,
    'transform': TransformService.createFromData,
    'scheduler': SchedulerService.createFromData
  }

  ServiceFactory.call(this, { ref, reportError, constructors })
}
