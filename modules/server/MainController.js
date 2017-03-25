const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { getAnalyticsDashboards } = require('./Cloudflare')
const HomePage = require('./components/HomePage')

const OneMinute = 1000 * 60
const ThirtyDays = OneMinute * 60 * 24 * 30
const DOCTYPE = '<!DOCTYPE html>'

const fetchStats = (callback) => {
  if (process.env.NODE_ENV === 'development') {
    callback(null, require('./CloudflareStats.json'))
  } else {
    const since = new Date(Date.now() - ThirtyDays)
    const until = new Date(Date.now() - OneMinute)

    getAnalyticsDashboards([ 'npmcdn.com', 'unpkg.com' ], since, until)
      .then(result => callback(null, result), callback)
  }
}

const sendHomePage = (req, res, next) => {
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

module.exports = {
  sendHomePage
}
