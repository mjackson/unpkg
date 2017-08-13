const fs = require('fs')
const path = require('path')
const http = require('http')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const { fetchStats } = require('./cloudflare')
const parseURL = require('./middleware/parseURL')
const checkBlacklist = require('./middleware/checkBlacklist')
const fetchPackage = require('./middleware/fetchPackage')
const findFile = require('./middleware/findFile')
const serveFile = require('./middleware/serveFile')

morgan.token('fwd', function (req) {
  return req.get('x-forwarded-for').replace(/\s/g, '')
})

function sendHomePage(publicDir) {
  const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8')

  return function (req, res, next) {
    fetchStats(function (error, stats) {
      if (error) {
        next(error)
      } else {
        res.set({
          'Cache-Control': 'public, max-age=60',
          'Cache-Tag': 'home'
        })

        res.send(
          // Replace the __SERVER_DATA__ token that was added to the
          // HTML file in the build process (see scripts/build.js).
          html.replace('__SERVER_DATA__', JSON.stringify({
            cloudflareStats: stats
          }))
        )
      }
    })
  }
}

function errorHandler(err, req, res, next) {
  res.status(500).type('text').send('Internal Server Error')
  console.error(err.stack)
  next(err)
}

function createServer() {
  const app = express()

  app.disable('x-powered-by')

  app.use(morgan(process.env.NODE_ENV === 'production'
    // Modified version of the Heroku router's log format
    // https://devcenter.heroku.com/articles/http-routing#heroku-router-log-format
    ? 'method=:method path=":url" host=:req[host] request_id=:req[x-request-id] cf_ray=:req[cf-ray] fwd=:fwd status=:status bytes=:res[content-length]'
    : 'dev'
  ))

  app.use(errorHandler)
  app.use(cors())

  app.get('/', sendHomePage('build'))

  app.use(express.static('build', {
    maxAge: '365d'
  }))

  app.use(parseURL)
  app.use(checkBlacklist)
  app.use(fetchPackage)
  app.use(findFile)
  app.use(serveFile)

  const server = http.createServer(app)

  // Heroku dynos automatically timeout after 30s. Set our
  // own timeout here to force sockets to close before that.
  // https://devcenter.heroku.com/articles/request-timeout
  server.setTimeout(25000, function (socket) {
    const message = `Timeout of 25 seconds exceeded`

    socket.end([
      `HTTP/1.1 503 Service Unavailable`,
      `Date: ${(new Date).toGMTString()}`,
      `Content-Type: text/plain`,
      `Content-Length: ${Buffer.byteLength(message)}`,
      `Connection: close`,
      ``,
      message
    ].join(`\r\n`))
  })

  return server
}

module.exports = createServer
