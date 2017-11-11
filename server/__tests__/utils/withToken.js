const AuthAPI = require('../../AuthAPI')

function withToken(scopes, callback) {
  AuthAPI.createToken(scopes).then(callback)
}

module.exports = withToken
