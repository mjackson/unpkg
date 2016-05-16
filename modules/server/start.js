import path from 'path'
import { createServer, createDevServer } from './index'

const port = process.env.PORT || 5000
const webpackConfig = require('../../webpack.config')
const statsFile = path.resolve(__dirname, '../../stats.json')
const publicDir = path.resolve(__dirname, '../../public')
const registryURL = process.env.REGISTRY_URL || 'https://registry.npmjs.org'
const bowerBundle = process.env.BOWER_BUNDLE || '/bower.zip'
const redirectTTL = process.env.REDIRECT_TTL || 500
const autoIndex = !process.env.DISABLE_INDEX
const redisURL = process.env.REDIS_URL

const serverConfig = {
  port,
  webpackConfig,
  statsFile,
  publicDir,
  registryURL,
  bowerBundle,
  redirectTTL,
  autoIndex,
  redisURL
}

const server = process.env.NODE_ENV === 'production'
  ? createServer(serverConfig)
  : createDevServer(serverConfig)

server.listen(port, () => {
  console.log('Server started on port %s, Ctrl+C to quit', port)
})
