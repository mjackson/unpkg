const AuthAPI = require('../AuthAPI')

function showPublicKey(req, res) {
  res.type('text').send(AuthAPI.getPublicKey())
}

module.exports = showPublicKey
