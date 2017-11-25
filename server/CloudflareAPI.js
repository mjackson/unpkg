require("isomorphic-fetch")
const invariant = require("invariant")
const gunzip = require("gunzip-maybe")
const ndjson = require("ndjson")

const CloudflareAPIURL = "https://api.cloudflare.com"
const CloudflareEmail = process.env.CLOUDFLARE_EMAIL
const CloudflareKey = process.env.CLOUDFLARE_KEY

invariant(CloudflareEmail, "Missing the $CLOUDFLARE_EMAIL environment variable")

invariant(CloudflareKey, "Missing the $CLOUDFLARE_KEY environment variable")

function get(path, headers) {
  return fetch(`${CloudflareAPIURL}/client/v4${path}`, {
    headers: Object.assign({}, headers, {
      "X-Auth-Email": CloudflareEmail,
      "X-Auth-Key": CloudflareKey
    })
  })
}

function getJSON(path, headers) {
  return get(path, headers)
    .then(res => {
      return res.json()
    })
    .then(data => {
      if (!data.success) {
        console.error(`CloudflareAPI.getJSON failed at ${path}`)
        console.error(data)
        throw new Error("Failed to getJSON from Cloudflare")
      }

      return data.result
    })
}

function getZones(domains) {
  return Promise.all(
    (Array.isArray(domains) ? domains : [domains]).map(domain => {
      return getJSON(`/zones?name=${domain}`)
    })
  ).then(results => {
    return results.reduce((memo, zones) => {
      return memo.concat(zones)
    })
  })
}

function reduceResults(target, values) {
  Object.keys(values).forEach(key => {
    const value = values[key]

    if (typeof value === "object" && value) {
      target[key] = reduceResults(target[key] || {}, value)
    } else if (typeof value === "number") {
      target[key] = (target[key] || 0) + values[key]
    }
  })

  return target
}

function getZoneAnalyticsDashboard(zones, since, until) {
  return Promise.all(
    (Array.isArray(zones) ? zones : [zones]).map(zone => {
      return getJSON(
        `/zones/${
          zone.id
        }/analytics/dashboard?since=${since.toISOString()}&until=${until.toISOString()}`
      )
    })
  ).then(results => {
    return results.reduce(reduceResults)
  })
}

function getJSONStream(path, headers) {
  const acceptGzipHeaders = Object.assign({}, headers, {
    "Accept-Encoding": "gzip"
  })

  return get(path, acceptGzipHeaders)
    .then(res => {
      return res.body.pipe(gunzip())
    })
    .then(stream => {
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
