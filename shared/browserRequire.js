(() => {
  const cache = {}

  // nodejs compatibility
  window.process = { env: {} }

  window.require = require

  function require(request, parent) {

    const { filename, content } = resolve(request, parent)
    return cache[filename] || (cache[filename] = execute(filename, content))

    function resolve(request, parent) {
      const http = new XMLHttpRequest()
      http.open("POST", "/nodeRequire", /* async = */ false)
      http.setRequestHeader("Content-Type", "application/json")
      http.send(JSON.stringify({ request, parent }))
      return JSON.parse(http.responseText)
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
