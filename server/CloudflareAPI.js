require('isomorphic-fetch')
const invariant = require('invariant')
const gunzip = require('gunzip-maybe')
const ndjson = require('ndjson')

const CloudflareAPIURL = 'https://api.cloudflare.com'
const CloudflareEmail = process.env.CLOUDFLARE_EMAIL
const CloudflareKey = process.env.CLOUDFLARE_KEY

invariant(
  CloudflareEmail,
  'Missing the $CLOUDFLARE_EMAIL environment variable'
)

invariant(
  CloudflareKey,
  'Missing the $CLOUDFLARE_KEY environment variable'
)

function get(path, headers) {
  return fetch(`${CloudflareAPIURL}/client/v4${path}`, {
    headers: Object.assign({}, headers, {
      'X-Auth-Email': CloudflareEmail,
      'X-Auth-Key': CloudflareKey
    })
  })
}

function getJSON(path, headers) {
  return get(path, headers).then(function (res) {
    return res.json()
  }).then(function (data) {
    return data.result
  })
}

function getZones(domain) {
  return getJSON(`/zones?name=${domain}`)
}

function getZoneAnalyticsDashboard(zoneId, since) {
  return getJSON(`/zones/${zoneId}/analytics/dashboard?since=${since}&continuous=true`)
}

function getJSONStream(path, headers) {
  const acceptGzipHeaders = Object.assign({}, headers, { 'Accept-Encoding': 'gzip' })

  return get(path, acceptGzipHeaders).then(function (res) {
    return res.body.pipe(gunzip())
  }).then(function (stream) {
    return stream.pipe(ndjson.parse())
  })
}

function getLogs(zoneId, startTime, endTime) {
  return getJSONStream(`/zones/${zoneId}/logs/requests?start=${startTime}&end=${endTime}`)
}

module.exports = {
  get,
  getJSON,
  getZones,
  getZoneAnalyticsDashboard,
  getJSONStream,
  getLogs
}
