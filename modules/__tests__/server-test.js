import request from 'supertest';

import createServer from '../createServer';

describe('The server', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('redirects /_meta to ?meta', done => {
    request(server)
      .get('/_meta/react')
      .end((err, res) => {
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe('/react?meta');
        done();
      });
  });

  it('redirects ?json to ?meta', done => {
    request(server)
      .get('/react?json')
      .end((err, res) => {
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe('/react?meta');
        done();
      });
  });

  it('redirects invalid query params', done => {
    request(server)
      .get('/react?main=index&invalid')
      .end((err, res) => {
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/react?main=index');
        done();
      });
  });

  it('rejects invalid package names', done => {
    request(server)
      .get('/_invalid/index.js')
      .end((err, res) => {
        expect(res.statusCode).toBe(403);
        done();
      });
  });
});
