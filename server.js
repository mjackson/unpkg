require('babel-register')({
  only: require('path').resolve(__dirname, './modules')
})

const createServer = require('./modules/ServerUtils').createServer

const port = process.env.PORT || 5000
const registryURL = process.env.REGISTRY_URL || 'https://registry.npmjs.org'
const bowerBundle = process.env.BOWER_BUNDLE || '/bower.zip'
const redirectTTL = process.env.REDIRECT_TTL || 500
const autoIndex = !process.env.DISABLE_INDEX
const redisURL = process.env.REDIS_URL

const server = createServer({
  registryURL: registryURL,
  bowerBundle: bowerBundle,
  redirectTTL: redirectTTL,
  autoIndex: autoIndex,
  redisURL: redisURL
})

server.listen(port, () => {
  console.log('Server started on port %s, Ctrl+C to quit', port)
})
