const AuthAPI = require('../AuthAPI')

describe('Auth API', () => {
  beforeEach(done => {
    AuthAPI.removeAllRevokedTokens().then(() => done(), done)
  })

  it('creates tokens with the right scopes', done => {
    const scopes = {
      blacklist: {
        add: true,
        remove: true
      }
    }

    AuthAPI.createToken(scopes).then(token => {
      AuthAPI.verifyToken(token).then(payload => {
        expect(payload.jti).toEqual(expect.any(String))
        expect(payload.iss).toEqual(expect.any(String))
        expect(payload.iat).toEqual(expect.any(Number))
        expect(payload.scopes).toMatchObject(scopes)
        done()
      })
    })
  })

  it('refuses to verify revoked tokens', done => {
    const scopes = {}

    AuthAPI.createToken(scopes).then(token => {
      AuthAPI.revokeToken(token).then(() => {
        AuthAPI.verifyToken(token).then(payload => {
          expect(payload).toBe(null)
          done()
        })
      })
    })
  })
})
