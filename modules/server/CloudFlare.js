import 'isomorphic-fetch'
import { createStack, createFetch, header, base, query, parseJSON, onResponse } from 'http-client'
import invariant from 'invariant'

const CloudFlareKey = process.env.CLOUDFLARE_KEY
const CloudFlareEmail = process.env.CLOUDFLARE_EMAIL

invariant(
  CloudFlareKey,
  'Missing $CLOUDFLARE_KEY environment variable'
)

invariant(
  CloudFlareEmail,
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
  header('X-Auth-Key', CloudFlareKey),
  header('X-Auth-Email', CloudFlareEmail),
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
