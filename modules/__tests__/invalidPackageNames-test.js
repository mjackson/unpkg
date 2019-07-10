import request from 'supertest';

import createServer from '../createServer';

describe('Invalid package names', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('are rejected', done => {
    request(server)
      .get('/_invalid/index.js')
      .end((err, res) => {
        expect(res.statusCode).toBe(403);
        done();
      });
  });
});
