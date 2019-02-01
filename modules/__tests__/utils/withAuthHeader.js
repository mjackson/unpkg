import withToken from './withToken';

function encodeBase64(token) {
  return Buffer.from(token).toString('base64');
}

export default function withAuthHeader(scopes, done) {
  withToken(scopes, token => {
    done(encodeBase64(token));
  });
}
