import request from 'supertest';

import createServer from '../createServer.js';

describe('A request with a trailing slash', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('that does not include the version number', () => {
    it('redirects to /browse', done => {
      request(server)
        .get('/react/')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toEqual('/browse/react/');
          done();
        });
    });
  });

  describe('that includes the version number', () => {
    it('redirects to /browse', done => {
      request(server)
        .get('/react@16.8.0/')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toEqual('/browse/react@16.8.0/');
          done();
        });
    });
  });
});
