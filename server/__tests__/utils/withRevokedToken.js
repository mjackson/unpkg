const withToken = require('./withToken')
const AuthAPI = require('../../AuthAPI')

function withRevokedToken(scopes, callback) {
  withToken(scopes, token => {
    AuthAPI.revokeToken(token).then(() => {
      callback(token)
    })
  })
}

module.exports = withRevokedToken
