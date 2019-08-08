import request from 'supertest';

import createServer from '../createServer.js';

describe('A request for metadata', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('returns 200', done => {
    request(server)
      .get('/react@16.8.0/?meta')
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/\bapplication\/json\b/);
        done();
      });
  });

  describe('with a package that includes a root "directory" entry', () => {
    it('returns 200', done => {
      request(server)
        .get('/sinuous@0.12.9/?meta')
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toMatch(/\bapplication\/json\b/);
          done();
        });
    });
  });

  describe('when the URL includes invalid query parameters', () => {
    it('removes them from the URL', done => {
      request(server)
        .get('/react@16.8.0/?meta&invalid')
        .end((err, res) => {
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toBe('/react@16.8.0/?meta');
          done();
        });
    });
  });
});
