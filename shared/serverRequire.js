import Module from 'module'
import fs from 'fs'
import bodyParser from 'body-parser'

export default [bodyParser.json(), nodeRequire]

function nodeRequire(req, res, next) {
  if (req.path !== '/nodeRequire')
    return next()

  if (req.method === 'GET')
    return res.sendFile(require.resolve('./browserRequire'))

  const { request, parent } = req.body

  res
    .status(200)
    .send(JSON.stringify(load(request, parent)))
}

function load(request, parent) {
  const filename = resolveRequest(request, parent)
  const content = loadJsContent(filename)
  return { filename, content }
}

function resolveRequest(request, parent) {
  return Module._resolveFilename(request, new DummyModule(parent))

  function DummyModule(filename = require.main.filename) {
    this.id = filename
    this.filename = filename
    this.paths = Module._nodeModulePaths(filename).concat(Module.globalPaths)
  }
}

function loadJsContent(filename) {
  let content = ''
  const contentCatcher = { _compile: processed => { content = processed } }
  require.extensions['.js'](contentCatcher, filename)
  return content
}
