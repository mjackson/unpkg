import request from 'supertest';

import createServer from '../createServer.js';

describe('A request for a module', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  // TODO: More tests here

  describe('when the URL includes invalid query parameters', () => {
    it('removes them from the URL', done => {
      request(server)
        .get('/react@16.8.0/?module&invalid')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toBe('/react@16.8.0/?module');
          done();
        });
    });
  });
});
