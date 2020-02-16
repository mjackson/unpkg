import request from 'supertest';

import createServer from '../createServer.js';

describe('A request for a module', () => {
  let server;
  let stopServer;
  beforeAll(done => {
    server = createServer();
    const handle = server.listen(62062, done);
    stopServer = callback => {
      handle.close(callback);
    };
  });
  afterAll(done => {
    stopServer(done);
  });

  describe('when "types" query parameter is NOT set', () => {
    it('doesn\'t include "X-Typescript-Types" header', done => {
      request(server)
        .get('/lodash-es@4.17.15/clamp.js?module')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['x-typescript-types']).toBe(undefined);
          done();
        });
    });
  });

  describe('when "types" query parameter is set', () => {
    describe('for modules that have typings lying alongside them', () => {
      it('includes "X-Typescript-Types" header', done => {
        request(server)
          .get('/react-sunbeam@0.11.0/dist/es/index.js?module&types')
          .end((err, res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers['x-typescript-types']).toBe(
              'http:/127.0.0.1:62062/react-sunbeam@0.11.0/dist/es/index.d.ts?module&types'
            );
            done();
          });
      });
    });

    describe('for modules that have typings in a corresponding @types/xxx package', () => {
      it('includes "X-Typescript-Types" header', done => {
        request(server)
          .get('/lodash-es@4.17.15/clamp.js?module&types')
          .end((err, res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers['x-typescript-types']).toBe(
              'http://127.0.0.1:62062/@types/lodash-es@4.17.3/clamp.d.ts?module&types'
            );
            done();
          });
      });
    });

    describe("for modules that don't have typings", () => {
      it('doesn\'t include "X-Typescript-Types" header', done => {
        request(server)
          .get('/lodash-es@4.17.15/_freeGlobal.js?module&types')
          .end((err, res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers['x-typescript-types']).toBe(undefined);
            done();
          });
      });
    });
  });
});
