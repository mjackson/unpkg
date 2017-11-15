const BlacklistAPI = require('../../BlacklistAPI')

function clearBlacklist(done) {
  BlacklistAPI.removeAllPackages().then(done, done)
}

module.exports = clearBlacklist
