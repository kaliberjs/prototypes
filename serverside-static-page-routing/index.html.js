module.exports = content => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Node serverside page routing</title>
  </head>
  <body>
    <div id="container">${content}</div>

    <script src="/react/react.js"></script>
    <script src="/react/react-dom.js"></script>
    <script src="/history/history.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.14.0/babel.min.js"></script>

    <script type="text/javascript">
      // we are loading scripts that are exporting commonjs style
      module = {}
    </script>

    <script type="text/babel" src="/source/App.js" data-plugins='transform-class-properties'></script>
    <script type="text/babel" src="/source/routes.js" data-plugins='transform-class-properties'></script>

    <script type="text/babel">
      init()

      function init() {
        const history = History.createBrowserHistory()
        history.listen(render)
        render(history.location)

        function render(location) {
          const route = matchRoute(location)
          ReactDOM.render(
            <App route={route} history={history} />,
            document.getElementById('container')
          )
        }

      }
    </script>
  </body>
</html>`
