import request from 'supertest';

import createServer from '../createServer.js';

describe('A request to browse a file', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('when the file exists', () => {
    it('returns an HTML page', done => {
      request(server)
        .get('/browse/react@16.8.0/umd/react.production.min.js')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toMatch(/\btext\/html\b/);
          done();
        });
    });
  });

  describe('when the file does not exist', () => {
    it('returns a 404 HTML page', done => {
      request(server)
        .get('/browse/react@16.8.0/not-here.js')
        .end((err, res) => {
          expect(res.statusCode).toBe(404);
          expect(res.headers['content-type']).toMatch(/\btext\/html\b/);
          done();
        });
    });
  });
});
