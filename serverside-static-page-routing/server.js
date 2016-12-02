const React = require('react')
const ReactDomServer = require('react-dom/server')
const express = require('express')
const { parsePath } = require('history/PathUtils')
import matchRoute from './routes'
import nodeRequire from '../shared/serverRequire'

import App from './App'

const app = express()

app.use(nodeRequire)
app.use((req, res, next) => {

  const location = parsePath(req.url)
  const route = matchRoute(location)

  res
    .status(route.isHit ? 200 : 404)
    .send(require('./index.html.js')(ReactDomServer.renderToString(<App route={route} />)))
})

app.listen(8000, () => console.log('Server listening at port 8000'))
