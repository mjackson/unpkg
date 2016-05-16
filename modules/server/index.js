import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import devErrorHandler from 'errorhandler'
import WebpackDevServer from 'webpack-dev-server'
import { createRequestHandler } from 'npm-http-server'
import { staticAssets, assetsCompiler, createDevCompiler } from './AssetsUtils'
import { sendHomePage } from './MainController'
import { logStats } from './StatsUtils'

export const createRouter = (config = {}) => {
  const router = express.Router()

  router.get('/', sendHomePage)

  if (config.redisURL)
    router.use(logStats(config.redisURL))

  router.use(createRequestHandler(config))

  return router
}

const errorHandler = (err, req, res, next) => {
  res.status(500).send('<p>Internal Server Error</p>')
  console.error(error.stack)
  next(err)
}

export const createServer = (config) => {
  const app = express()

  app.disable('x-powered-by')
  app.use(errorHandler)
  app.use(cors())
  app.use(express.static(config.publicDir, { maxAge: 60000 }))
  app.use(staticAssets(config.statsFile))
  app.use(createRouter(config))

  return app
}

export const createDevServer = (config) => {
  const webpackConfig = config.webpackConfig
  const compiler = createDevCompiler(
    webpackConfig,
    `webpack-dev-server/client?http://localhost:${config.port}`
  )

  const server = new WebpackDevServer(compiler, {
    // webpack-dev-middleware options.
    publicPath: webpackConfig.output.publicPath,
    quiet: false,
    noInfo: false,
    stats: {
      // https://webpack.github.io/docs/node.js-api.html#stats-tojson
      assets: true,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false
    },

    // webpack-dev-server options.
    contentBase: false,
    setup(app) {
      // This runs before webpack-dev-middleware.
      app.disable('x-powered-by')
      app.use(morgan('dev'))
    }
  })

  // This runs after webpack-dev-middleware.
  server.use(devErrorHandler())
  server.use(express.static(config.publicDir))
  server.use(assetsCompiler(compiler))
  server.use(createRouter(config))

  return server
}
