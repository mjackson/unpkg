import 'isomorphic-fetch'
import { createStack, createFetch, header, base, query, parseJSON, onResponse } from 'http-client'
import invariant from 'invariant'

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

export const getZones = (domainName) =>
  createFetch(
    commonStack,
    createNameQuery(domainName)
  )('/zones')

export const getZoneAnalyticsDashboard = (zone, since, until) =>
  createFetch(
    commonStack,
    createRangeQuery(since, until)
  )(`/zones/${zone.id}/analytics/dashboard`)

export const getAnalyticsDashboards = (domainNames, since, until) =>
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
