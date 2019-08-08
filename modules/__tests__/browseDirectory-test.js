import request from 'supertest';

import createServer from '../createServer.js';

describe('A request to browse a directory', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('with no version specified', () => {
    it('redirects to the latest version', done => {
      request(server)
        .get('/browse/react/')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toMatch(
            /\/browse\/react@\d+\.\d+\.\d+\//
          );
          done();
        });
    });
  });

  describe('when the directory exists', () => {
    it('returns an HTML page', done => {
      request(server)
        .get('/browse/react@16.8.0/umd/')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toMatch(/\btext\/html\b/);
          done();
        });
    });
  });

  describe('when the directory does not exist', () => {
    it('returns a 404 HTML page', done => {
      request(server)
        .get('/browse/react@16.8.0/not-here/')
        .end((err, res) => {
          expect(res.statusCode).toBe(404);
          expect(res.headers['content-type']).toMatch(/\btext\/html\b/);
          done();
        });
    });
  });

  describe('with invalid query params', () => {
    it('strips them from the query string', done => {
      request(server)
        .get('/browse/react@16.8.0/umd/?invalid')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toEqual('/browse/react@16.8.0/umd/');
          done();
        });
    });
  });
});
