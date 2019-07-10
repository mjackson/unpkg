import request from 'supertest';

import createServer from '../createServer.js';

describe('A request for a directory', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('when a .js file exists with the same name', () => {
    it('is redirected to the .js file', done => {
      request(server)
        .get('/preact@8.4.2/devtools')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toEqual('/preact@8.4.2/devtools.js');
          done();
        });
    });
  });

  describe('when a .json file exists with the same name', () => {
    it('is redirected to the .json file');
  });

  describe('when it contains an index.js file', () => {
    it('is redirected to the index.js file', done => {
      request(server)
        .get('/preact@8.4.2/src/dom')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toEqual(
            '/preact@8.4.2/src/dom/index.js'
          );
          done();
        });
    });
  });
});
