import request from 'supertest';

import createServer from '../createServer';

describe('Legacy URLs', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('redirect /_meta to ?meta', done => {
    request(server)
      .get('/_meta/react')
      .end((err, res) => {
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe('/react?meta');
        done();
      });
  });

  it('redirect ?json to ?meta', done => {
    request(server)
      .get('/react?json')
      .end((err, res) => {
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe('/react?meta');
        done();
      });
  });

  it('redirect */ to /browse/*/', done => {
    request(server)
      .get('/react@16.8.0/umd/')
      .end((err, res) => {
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toEqual('/browse/react@16.8.0/umd/');
        done();
      });
  });
});
