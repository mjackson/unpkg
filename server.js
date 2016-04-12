const cors = require('cors')
const express = require('express')
const createRequestHandler = require('npm-http-server').createRequestHandler
const onFinished = require('on-finished')
const redis = require('redis')

const registryURL = process.env.npm_package_config_registryURL
const bowerBundle = process.env.npm_package_config_bowerBundle
const redirectTTL = process.env.npm_package_config_redirectTTL
const autoIndex = process.env.npm_package_config_autoIndex
const port = process.env.PORT || process.env.npm_package_config_port

const requestLogging = (redisURL) => {
  const redisClient = redis.createClient(redisURL)

  return (req, res, next) => {
    onFinished(res, () => {
      const path = req.path

      if (res.statusCode === 200 && path.charAt(path.length - 1) !== '/') {
        redisClient.zincrby([ 'request-paths', 1, path ])

        const packageSpec = path.split('/')[1]
        const atIndex = packageSpec.lastIndexOf('@')
        const packageName = packageSpec.substring(0, atIndex)

        redisClient.zincrby([ 'package-requests', 1, packageName ])
      }
    })

    next()
  }
}

const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(express.static('public', { maxAge: 60000 }))

if (process.env.REDIS_URL)
  app.use(requestLogging(process.env.REDIS_URL))

app.use(createRequestHandler({
  registryURL: registryURL,
  bowerBundle: bowerBundle,
  redirectTTL: redirectTTL,
  autoIndex: autoIndex
}))

app.listen(port, function () {
  console.log('Server started on port %s, Ctrl+C to quit', port)
})
