const request = require('supertest')
const createApp = require('./createApp')

describe('The server app', function () {
  let app
  beforeEach(function () {
    app = createApp()
  })

  it('rejects invalid package names', function (done) {
    request(app).get('/_invalid/index.js').then(function (res) {
      expect(res.statusCode).toBe(403)
      done()
    })
  })

  it('redirects invalid query params', function (done) {
    request(app).get('/react?main=index&invalid').then(function (res) {
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toBe('/react?main=index')
      done()
    })
  })

  it('redirects /_meta to ?meta', function (done) {
    request(app).get('/_meta/react?main=index').then(function (res) {
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toBe('/react?main=index&meta')
      done()
    })
  })
})
