require('isomorphic-fetch')
const { createStack, createFetch, header, base, query, parseJSON, onResponse } = require('http-client')
const invariant = require('invariant')

const CloudflareKey = process.env.CLOUDFLARE_KEY
const CloudflareEmail = process.env.CLOUDFLARE_EMAIL

invariant(
  CloudflareKey,
  'Missing $CLOUDFLARE_KEY environment variable'
)

invariant(
  CloudflareEmail,
  'Missing $CLOUDFLARE_EMAIL environment variable'
)

const createRangeQuery = (since, until) =>
  query({
    since: since.toISOString(),
    until: until.toISOString()
  })

const createNameQuery = (name) =>
  query({ name })

const getResult = () =>
  createStack(
    parseJSON(),
    onResponse(response => response.jsonData.result)
  )

const commonStack = createStack(
  header('X-Auth-Key', CloudflareKey),
  header('X-Auth-Email', CloudflareEmail),
  base('https://api.cloudflare.com/client/v4'),
  getResult()
)

const getZones = (domainName) =>
  createFetch(
    commonStack,
    createNameQuery(domainName)
  )('/zones')

const getZoneAnalyticsDashboard = (zone, since, until) =>
  createFetch(
    commonStack,
    createRangeQuery(since, until)
  )(`/zones/${zone.id}/analytics/dashboard`)

const getAnalyticsDashboards = (domainNames, since, until) =>
  Promise.all(
    domainNames.map(domainName => getZones(domainName))
  ).then(
    domainZones => domainZones.reduce((memo, zones) => memo.concat(zones))
  ).then(
    zones => Promise.all(zones.map(zone => getZoneAnalyticsDashboard(zone, since, until)))
  ).then(
    results => results.reduce(reduceResults)
  )

const reduceResults = (target, results) => {
  Object.keys(results).forEach(key => {
    const value = results[key]

    if (typeof value === 'object' && value) {
      target[key] = reduceResults(target[key] || {}, value)
    } else if (typeof value === 'number') {
      target[key] = (target[key] || 0) + results[key]
    }
  })

  return target
}

const OneMinute = 1000 * 60
const ThirtyDays = OneMinute * 60 * 24 * 30

const fetchStats = (callback) => {
  const since = new Date(Date.now() - ThirtyDays)
  const until = new Date(Date.now() - OneMinute)

  getAnalyticsDashboards([ 'npmcdn.com', 'unpkg.com' ], since, until)
    .then(result => callback(null, result), callback)
}

module.exports = {
  getZones,
  getZoneAnalyticsDashboard,
  getAnalyticsDashboards,
  fetchStats
}
