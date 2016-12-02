import { createBrowserHistory } from 'history'
import matchRoute from './routes'
import App from './App'
import ReactDOM from 'react-dom'
import React from 'react'

const history = createBrowserHistory()
history.listen(render)
render(history.location)

function render(location) {
  const route = matchRoute(location)
  ReactDOM.render(
    <App route={route} history={history} />,
    document.getElementById('container')
  )
}
