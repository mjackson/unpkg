const express = require('express')
const subDays = require('date-fns/sub_days')
const startOfDay = require('date-fns/start_of_day')
const startOfSecond = require('date-fns/start_of_second')
const StatsServer = require('./StatsServer')

function serveArbitraryStats(req, res) {
  const now = startOfSecond(new Date)
  const since = req.query.since ? new Date(req.query.since) : subDays(now, 30)
  const until = req.query.until ? new Date(req.query.until) : now

  if (isNaN(since.getTime()))
    return res.status(403).send({ error: '?since is not a valid date' })

  if (isNaN(until.getTime()))
    return res.status(403).send({ error: '?until is not a valid date' })

  if (until <= since)
    return res.status(403).send({ error: '?until date must come after ?since date' })

  if (until > now)
    return res.status(403).send({ error: '?until must be a date in the past' })

  StatsServer.getStats(since, until, function (error, stats) {
    if (error) {
      console.error(error)
      res.status(500).send({ error: 'Unable to fetch stats' })
    } else {
      res.set({
        'Cache-Control': 'public, max-age=60',
        'Cache-Tag': 'stats'
      }).send(stats)
    }
  })
}

function servePastDaysStats(days, req, res) {
  const until = startOfDay(new Date)
  const since = subDays(until, days)

  StatsServer.getStats(since, until, function (error, stats) {
    if (error) {
      console.error(error)
      res.status(500).send({ error: 'Unable to fetch stats' })
    } else {
      res.set({
        'Cache-Control': 'public, max-age=60',
        'Cache-Tag': 'stats'
      }).send(stats)
    }
  })
}

function serveLastMonthStats(req, res) {
  servePastDaysStats(30, req, res)
}

function serveLastWeekStats(req, res) {
  servePastDaysStats(7, req, res)
}

function serveLastDayStats(req, res) {
  servePastDaysStats(1, req, res)
}

function createStatsServer() {
  const app = express.Router()

  app.get('/', serveArbitraryStats)
  app.get('/last-month', serveLastMonthStats)
  app.get('/last-week', serveLastWeekStats)
  app.get('/last-day', serveLastDayStats)

  return app
}

module.exports = createStatsServer
