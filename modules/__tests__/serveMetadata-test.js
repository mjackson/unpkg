import request from 'supertest';

import createServer from '../createServer.js';

describe('A request for metadata', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('returns 200', done => {
    request(server)
      .get('/react@16.8.6/?meta')
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
});
