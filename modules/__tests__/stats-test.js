import request from 'supertest';

import createServer from '../createServer.js';

describe('A request for stats', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('returns a 200 JSON response', done => {
    request(server)
      .get('/api/stats')
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/\bapplication\/json\b/);
        done();
      });
  });
});
