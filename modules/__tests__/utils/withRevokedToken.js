const withToken = require("./withToken");
const AuthAPI = require("../../AuthAPI");

function withRevokedToken(scopes, done) {
  withToken(scopes, token => {
    AuthAPI.revokeToken(token).then(() => {
      done(token);
    });
  });
}

module.exports = withRevokedToken;
