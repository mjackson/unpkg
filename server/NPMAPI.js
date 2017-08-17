require('isomorphic-fetch')

const NPMAPIURL = 'https://api.npmjs.org'

function getJSON(path) {
  return fetch(`${NPMAPIURL}${path}`, {
    headers: {
      Accept: 'application/json'
    }
  }).then(function (res) {
    return res.status === 404 ? null : res.json()
  })
}

module.exports = {
  getJSON
}
