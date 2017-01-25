module.export = syncToObject

function syncToObject(ref, obj) {

  const cancelFunctions = [
    subscribe('child_added', set),
    subscribe('child_changed', set),
    subscribe('child_removed', remove)
  ]

  return () => {
    cancelFunctions.forEach(f => f())
    Object.keys(obj).forEach(key => delete obj[key])
  }

  function set(data) { obj[data.key] = data }
  function remove(data) { delete obj[data.key] }

  function subscribe(eventType, handler) {
    ref.on(eventType, handler)

    return () => ref.off(eventType, handler)
  }
}
