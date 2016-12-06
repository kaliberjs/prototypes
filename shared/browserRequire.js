(() => {
  const moduleCache = {}
  const resolveCache = {}

  window.require = require

  function require(request, parent) {

    const key = cacheKey(request, parent)
    const { filename, content, dependencies } = resolveCache[key] || (resolveCache[key] = resolve(request, parent))

    cacheDependencies({ filename, dependencies })

    return moduleCache[filename] || (moduleCache[filename] = execute(filename, content))

    function cacheKey(request, parent) {
      return request + ' -- ' + parent
    }

    function resolve(request, parent) {
      const http = new XMLHttpRequest()
      http.open("POST", "/nodeRequire", /* async = */ false)
      http.setRequestHeader("Content-Type", "application/json")
      http.send(JSON.stringify({ request, parent }))

      return JSON.parse(http.responseText)
    }

    function cacheDependencies({ filename, dependencies }) {
      Object.keys(dependencies).forEach(dependency => {
        const result = dependencies[dependency]
        resolveCache[cacheKey(dependency, filename)] = result
        cacheDependencies(result)
      })
    }

    function execute(filename, content) {
      const wrapped = eval(`(function wrapped(exports, require, module, process) {\n${content}\n})`)

      const process = { env: {} }
      const exports = {}
      const module = { exports }

      wrapped(exports, request => require(request, filename), module, process)

      return module.exports
    }
  }
})()
