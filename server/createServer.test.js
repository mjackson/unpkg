const request = require('supertest')
const createServer = require('./createServer')

describe('The server app', function() {
  let app
  beforeEach(() => {
    app = createServer()
  })

  it('rejects invalid package names', function(done) {
    request(app)
      .get('/_invalid/index.js')
      .then(res => {
        expect(res.statusCode).toBe(403)
        done()
      })
  })

  it('redirects invalid query params', function(done) {
    request(app)
      .get('/react?main=index&invalid')
      .then(res => {
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toBe('/react?main=index')
        done()
      })
  })

  it('redirects /_meta to ?meta', function(done) {
    request(app)
      .get('/_meta/react?main=index')
      .then(res => {
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toBe('/react?main=index&meta')
        done()
      })
  })
})
