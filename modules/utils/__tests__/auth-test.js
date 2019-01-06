import * as auth from '../auth';

describe('Auth API', () => {
  beforeEach(done => {
    auth.removeAllRevokedTokens().then(() => done(), done);
  });

  it('creates tokens with the right scopes', done => {
    const scopes = {
      blacklist: {
        add: true,
        remove: true
      }
    };

    auth.createToken(scopes).then(token => {
      auth.verifyToken(token).then(payload => {
        expect(payload.jti).toEqual(expect.any(String));
        expect(payload.iss).toEqual(expect.any(String));
        expect(payload.iat).toEqual(expect.any(Number));
        expect(payload.scopes).toMatchObject(scopes);
        done();
      });
    });
  });

  it('refuses to verify revoked tokens', done => {
    const scopes = {};

    auth.createToken(scopes).then(token => {
      auth.revokeToken(token).then(() => {
        auth.verifyToken(token).then(payload => {
          expect(payload).toBe(null);
          done();
        });
      });
    });
  });
});
