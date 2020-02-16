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

  describe('that is a TypeScript file', () => {
    it('bare imports should be rewritten to URL imports', done => {
      request(server)
        .get('/@types/lodash-es@4.17.3/clamp.d.ts?module')
        .end((err, res) => {
          expect(err).toBe(null);
          expect(res.statusCode).toBe(200);
          expect(res.text).toContain(
            'import { clamp } from "http://127.0.0.1:62062/@types/lodash@*?module"'
          );
          done(err);
        });
    });
  });
});
