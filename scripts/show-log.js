require('isomorphic-fetch')
const invariant = require('invariant')

const CloudflareEmail = process.env.CLOUDFLARE_EMAIL
const CloudflareKey = process.env.CLOUDFLARE_KEY
const RayID = process.argv[2]

invariant(CloudflareEmail, 'Missing the $CLOUDFLARE_EMAIL environment variable')

invariant(CloudflareKey, 'Missing the $CLOUDFLARE_KEY environment variable')

invariant(
  RayID,
  'Missing the RAY_ID argument; use `heroku run node show-log.js RAY_ID`'
)

function getZones(domain) {
  return fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': CloudflareEmail,
      'X-Auth-Key': CloudflareKey
    }
  })
    .then(res => res.json())
    .then(data => data.result)
}

function getLog(zoneId, rayId) {
  return fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/logs/requests/${rayId}`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Email': CloudflareEmail,
        'X-Auth-Key': CloudflareKey
      }
    }
  ).then(res => (res.status === 404 ? 'NOT FOUND' : res.json()))
}

getZones('unpkg.com').then(zones => {
  getLog(zones[0].id, RayID).then(entry => {
    console.log(entry)
  })
})
