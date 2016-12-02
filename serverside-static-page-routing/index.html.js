module.exports = content => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Node serverside page routing</title>
  </head>
  <body>
    <div id="container">${content}</div>

    <script src='/nodeRequire' type="text/javascript"></script>
    <script type="text/javascript">require('./client')</script>
  </body>
</html>`
