const path = require('path')
const throng = require('throng')
const { startServer } = require('./server/index')

const port = parseInt(process.env.PORT, 10) || 5000
const publicDir = path.resolve(__dirname, 'build')

throng({
  workers: process.env.WEB_CONCURRENCY || 1,
  start: (id) => startServer({ id, port, publicDir }),
  lifetime: Infinity
})
