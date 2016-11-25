const React = require('react')
const ReactDomServer = require('react-dom/server')
const express = require('express')
const { parsePath } = require('history/PathUtils')
const matchRoute = require('./routes')
const { basename } = require('path')

const App = require('./App')

const app = express()
const router = express.Router()

app.use('/react', express.static('../react'))
app.use('/history', express.static('../history'))
app.use('/source', (req, res) => res.sendFile(require.resolve('./' + basename(req.path))))
app.use((req, res, next) => {

  const location = parsePath(req.url)
  const route = matchRoute(location)

  res
    .status(route.isHit ? 200 : 404)
    .send(require('./index.html.js')(ReactDomServer.renderToString(<App route={route} />)))
})

app.listen(8000, () => console.log('Server listening at port 8000'))
