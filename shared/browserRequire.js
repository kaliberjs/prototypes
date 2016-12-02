(() => {
  const moduleCache = {}
  const resolveCache = {}

  // nodejs compatibility
  window.process = { env: {} }

  window.require = require

  function require(request, parent) {

    const key = cacheKey(request, parent)
    const { filename, content } = resolveCache[key] || (resolveCache[key] = resolve(request, parent))
    return moduleCache[filename] || (moduleCache[filename] = execute(filename, content))

    function cacheKey(request, parent) {
      return request + ' -- ' + parent
    }

    function resolve(request, parent) {
      const http = new XMLHttpRequest()
      http.open("POST", "/nodeRequire", /* async = */ false)
      http.setRequestHeader("Content-Type", "application/json")
      http.send(JSON.stringify({ request, parent }))

      const result = JSON.parse(http.responseText)
      storeInCache(result)

      return result
    }

    function storeInCache({ filename, dependencies }) {
      Object.keys(dependencies).forEach(dependency => {
        const result = dependencies[dependency]
        resolveCache[cacheKey(dependency, filename)] = result
        storeInCache(result)
      })
    }

    function execute(filename, content) {
      const wrapped = eval(`(function wrapped(exports, require, module) {\n${content}\n})`)

      const exports = {}
      const module = { exports }

      wrapped(exports, request => require(request, filename), module)

      return module.exports
    }
  }
})()
