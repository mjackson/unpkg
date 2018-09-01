const AuthAPI = require("../../AuthAPI");

function withToken(scopes, done) {
  AuthAPI.createToken(scopes).then(done);
}

module.exports = withToken;
