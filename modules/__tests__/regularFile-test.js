import request from 'supertest';

import createServer from '../createServer.js';

describe('A request for a JavaScript file', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('returns 200', done => {
    request(server)
      .get('/react@16.8.0/index.js')
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(
          /\bapplication\/javascript\b/
        );
        expect(res.headers['content-type']).toMatch(/\bcharset=utf-8\b/);
        done();
      });
  });

  describe('from a scoped package', () => {
    it('returns 200', done => {
      request(server)
        .get('/@babel/core@7.5.4/lib/index.js')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toMatch(
            /\bapplication\/javascript\b/
          );
          expect(res.headers['content-type']).toMatch(/\bcharset=utf-8\b/);
          done();
        });
    });
  });

  describe('when the URL has invalid query params', () => {
    it('removes them from the URL', done => {
      request(server)
        .get('/react@16.8.0/index.js?invalid')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toBe('/react@16.8.0/index.js');
          done();
        });
    });
  });
});
