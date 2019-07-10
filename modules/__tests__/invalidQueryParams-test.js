import request from 'supertest';

import createServer from '../createServer';

describe('Invalid query params', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('redirect to the same path w/out those params', done => {
    request(server)
      .get('/d3?module&invalid-param')
      .end((err, res) => {
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/d3?module');
        done();
      });
  });
});
