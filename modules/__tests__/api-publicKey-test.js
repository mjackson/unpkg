import request from 'supertest';

import createServer from '../createServer';

describe('The /api/publicKey endpoint', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('GET /api/publicKey', () => {
    it('echoes the public key', done => {
      request(server)
        .get('/api/publicKey')
        .end((err, res) => {
          expect(res.text).toMatch(/PUBLIC KEY/);
          done();
        });
    });
  });
});
