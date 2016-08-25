import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { getZones, getZoneAnalyticsDashboard } from './CloudFlare'
import HomePage from './components/HomePage'

const OneMinute = 1000 * 60
const ThirtyDays = OneMinute * 60 * 24 * 30
const DOCTYPE = '<!DOCTYPE html>'

const fetchStats = (callback) => {
  if (process.env.NODE_ENV === 'development') {
    callback(null, require('./CloudFlareStats.json'))
  } else {
    getZones('unpkg.com')
      .then(zones => {
        const zone = zones[0]
        const since = new Date(Date.now() - ThirtyDays)
        const until = new Date(Date.now() - OneMinute)

        return getZoneAnalyticsDashboard(zone, since, until).then(result => {
          callback(null, result)
        })
      })
      .catch(callback)
  }
}

export const sendHomePage = (req, res, next) => {
  const chunks = [ 'vendor', 'home' ]
  const props = {
    styles: req.bundle.getStyleAssets(chunks),
    scripts: req.bundle.getScriptAssets(chunks)
  }

  if (req.manifest)
    props.webpackManifest = req.manifest

  fetchStats((error, stats) => {
    if (error) {
      next(error)
    } else {
      res.set('Cache-Control', 'public, max-age=60')

      res.send(
        DOCTYPE + renderToStaticMarkup(<HomePage {...props} stats={stats}/>)
      )
    }
  })
}
