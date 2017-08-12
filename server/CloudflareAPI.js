require('isomorphic-fetch')
const invariant = require('invariant')

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
  return fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: 'GET',
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

module.exports = {
  get,
  getJSON
}
