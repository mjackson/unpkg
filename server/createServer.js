const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const checkBlacklist = require('./middleware/checkBlacklist')
const fetchFile = require('./middleware/fetchFile')
const parseURL = require('./middleware/parseURL')
const requireAuth = require('./middleware/requireAuth')
const serveFile = require('./middleware/serveFile')
const userToken = require('./middleware/userToken')

morgan.token('fwd', function(req) {
  return req.get('x-forwarded-for').replace(/\s/g, '')
})

function errorHandler(err, req, res, next) {
  console.error(err.stack)

  res
    .status(500)
    .type('text')
    .send('Internal Server Error')

  next(err)
}

function createServer() {
  const app = express()

  app.disable('x-powered-by')

  if (process.env.NODE_ENV !== 'test') {
    app.use(
      morgan(
        process.env.NODE_ENV === 'production'
          ? // Modified version of the Heroku router's log format
            // https://devcenter.heroku.com/articles/http-routing#heroku-router-log-format
            'method=:method path=":url" host=:req[host] request_id=:req[x-request-id] cf_ray=:req[cf-ray] fwd=:fwd status=:status bytes=:res[content-length]'
          : 'dev'
      )
    )
  }

  app.use(errorHandler)

  app.use(
    express.static('build', {
      maxAge: '365d'
    })
  )

  app.use(cors())
  app.use(bodyParser.json())
  app.use(userToken)

  app.get('/_publicKey', require('./actions/showPublicKey'))

  app.post('/_auth', require('./actions/createAuth'))
  app.get('/_auth', require('./actions/showAuth'))

  app.post(
    '/_blacklist',
    requireAuth('blacklist.add'),
    require('./actions/addToBlacklist')
  )
  app.get(
    '/_blacklist',
    requireAuth('blacklist.read'),
    require('./actions/showBlacklist')
  )
  app.delete(
    '/_blacklist/:packageName',
    requireAuth('blacklist.remove'),
    require('./actions/removeFromBlacklist')
  )

  if (process.env.NODE_ENV !== 'test') {
    app.get('/_stats', require('./actions/showStats'))
  }

  app.use('/', parseURL, checkBlacklist, fetchFile, serveFile)

  return app
}

module.exports = createServer
