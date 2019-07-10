import request from 'supertest';

import createServer from '../createServer.js';

describe('A request that targets a directory with a trailing slash', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('when the directory exists', () => {
    it('returns an HTML page', done => {
      request(server)
        .get('/react@16.8.0/umd/')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toMatch(/\btext\/html\b/);
          done();
        });
    });
  });

  describe('when the directory does not exist', () => {
    it('returns a 404 text error', done => {
      request(server)
        .get('/react@16.8.0/not-here/')
        .end((err, res) => {
          expect(res.statusCode).toBe(404);
          expect(res.headers['content-type']).toMatch(/\btext\/plain\b/);
          done();
        });
    });
  });
});
