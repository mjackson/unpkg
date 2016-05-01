import path from 'path'
import cors from 'cors'
import express from 'express'
import ExpressReactViews from 'express-react-views'
import { createRequestHandler } from 'npm-http-server'
import { logStats } from './StatsUtils'

const serveHomePage = (req, res) =>
  res.render('HomePage')

export const createServer = (options = {}) => {
  const app = express()

  app.disable('x-powered-by')
  app.set('view engine', 'js')
  app.set('views', path.resolve(__dirname, 'components'))
  app.engine('js', ExpressReactViews.createEngine({
    transformViews: false
  }))

  app.use(cors())
  app.use(express.static('public', { maxAge: 60000 }))

  if (options.redisURL)
    app.use(logStats(options.redisURL))

  app.get('/', serveHomePage)
  app.use(createRequestHandler(options))

  return app
}
