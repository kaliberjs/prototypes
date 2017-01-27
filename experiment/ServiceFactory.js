const noop = Promise.resolve(null)

module.exports = ServiceFactory

function ServiceFactory({ ref, reportError, constructors }) {

  const shutdownFunctions = {}

  ref.on('child_added', childAdded)
  ref.on('child_removed', childRemoved)

  this.shutdown = () => {
    ref.off('child_added', childAdded)
    ref.off('child_removed', childRemoved)
    return Promise.all(
      Object
        .keys(shutdownFunctions)
        .map(key => shutdownFunctions[key].call())
    )
  }

  function childAdded({ ref, key }) {
    let instance = null
    ref.on('value', shutdownAndCreateInstance)

    shutdownFunctions[key] = () => {
      ref.off('value', shutdownAndCreateInstance)
      return shutdown(instance).then(_ => {
        instance = null
        delete shutdownFunctions[key]
      })
    }

    function shutdownAndCreateInstance(data) {
      shutdown(instance).then(_ => { instance = createInstance(data) })
    }

    function createInstance(data) {
      const type = data.child('type').val()

      const constructor = constructors[type]
      if (!constructor) return setAndReportError(data.ref, `Could not find constructor for '${type}'`)

      console.log(`Creating service of type '${type}'`)
      return constructor(data, reportError)
    }

    function shutdown(instance) {
      return instance ? instance.shutdown() : noop
    }

    function setAndReportError(ref, message) {
      reportError(message)
      return ref.update({ _error: message })
    }
  }

  function childRemoved({ key }) {
    shutdownFunctions[key].call()
  }
}
