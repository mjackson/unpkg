const http = require('http')
const throng = require('throng')
const createApp = require('./server/createApp')

const port = parseInt(process.env.PORT, 10) || 5000

function startServer(id) {
  const server = http.createServer(createApp())

  // Heroku dynos automatically timeout after 30s. Set our
  // own timeout here to force sockets to close before that.
  // https://devcenter.heroku.com/articles/request-timeout
  server.setTimeout(25000, function (socket) {
    const message = `Timeout of 25 seconds exceeded`

    socket.end([
      'HTTP/1.1 503 Service Unavailable',
      'Date: ' + (new Date).toGMTString(),
      'Content-Length: ' + Buffer.byteLength(message),
      'Content-Type: text/plain',
      'Connection: close',
      '',
      message
    ].join('\r\n'))
  })

  server.listen(port, function () {
    console.log('Server #%s listening on port %s, Ctrl+C to stop', id, port)
  })
}

throng({
  workers: process.env.WEB_CONCURRENCY || 1,
  lifetime: Infinity,
  grace: 25000,
  start: startServer
})
