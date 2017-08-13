const throng = require('throng')
const createServer = require('./server/createServer')

const port = parseInt(process.env.PORT, 10) || 5000

throng({
  workers: process.env.WEB_CONCURRENCY || 1,
  lifetime: Infinity,
  start: function (id) {
    const server = createServer()

    server.listen(port, function () {
      console.log('Server #%s listening on port %s, Ctrl+C to stop', id, port)
    })
  }
})
