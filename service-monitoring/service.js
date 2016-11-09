const server = require('net').createServer(socket => socket.pipe(socket))
server.listen(
  require('minimist')(process.argv).port ||
  (console.error('missing --port=...'), process.exit(1)),
  '127.0.0.1'
)

console.log('Service started')

process.on('SIGINT', () => {
  console.log('')
  console.log('Shutting down service')

  server.close(_ => {
    console.log('Service shutdown')
    process.exit(1)
  })
})
