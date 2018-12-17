const withToken = require('./withToken');

function encodeBase64(token) {
  return Buffer.from(token).toString('base64');
}

function withAuthHeader(scopes, done) {
  withToken(scopes, token => {
    done(encodeBase64(token));
  });
}

module.exports = withAuthHeader;
