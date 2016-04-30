import cors from 'cors'
import express from 'express'
import { createRequestHandler } from 'npm-http-server'
import { logStats } from './StatsUtils'

export const createServer = (options = {}) => {
  const app = express()

  app.disable('x-powered-by')
  app.use(cors())
  app.use(express.static('public', { maxAge: 60000 }))

  if (options.redisURL)
    app.use(logStats(options.redisURL))

  app.use(createRequestHandler(options))

  return app
}
