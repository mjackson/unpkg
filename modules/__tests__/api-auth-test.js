import request from 'supertest';

import createServer from '../createServer';
import withAuthHeader from './utils/withAuthHeader';
import withRevokedToken from './utils/withRevokedToken';
import withToken from './utils/withToken';

describe('The /api/auth endpoint', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('POST /api/auth', () => {
    it('creates a new auth token', done => {
      request(server)
        .post('/api/auth')
        .end((err, res) => {
          expect(res.body).toHaveProperty('token');
          done();
        });
    });
  });

  describe('GET /api/auth', () => {
    describe('with no auth', () => {
      it('echoes back null', done => {
        request(server)
          .get('/api/auth')
          .end((err, res) => {
            expect(res.body).toHaveProperty('auth');
            expect(res.body.auth).toBe(null);
            done();
          });
      });
    });

    describe('with a revoked auth token', () => {
      it('echoes back null', done => {
        withRevokedToken({ some: { scope: true } }, token => {
          request(server)
            .get('/api/auth?token=' + token)
            .end((err, res) => {
              expect(res.body).toHaveProperty('auth');
              expect(res.body.auth).toBe(null);
              done();
            });
        });
      });
    });

    describe('with a valid auth token', () => {
      describe('in the query string', () => {
        it('echoes back the auth payload', done => {
          const scopes = { some: { scope: true } };

          withToken(scopes, token => {
            request(server)
              .get('/api/auth?token=' + token)
              .end((err, res) => {
                expect(res.body).toHaveProperty('auth');
                expect(res.body.auth).toBeDefined();
                expect(res.body.auth.scopes).toMatchObject(scopes);
                done();
              });
          });
        });
      });

      describe('in the Authorization header', () => {
        it('echoes back the auth payload', done => {
          const scopes = { some: { scope: true } };

          withAuthHeader(scopes, header => {
            request(server)
              .get('/api/auth')
              .set({ Authorization: header })
              .end((err, res) => {
                expect(res.body).toHaveProperty('auth');
                expect(res.body.auth).toBeDefined();
                expect(res.body.auth.scopes).toMatchObject(scopes);
                done();
              });
          });
        });
      });
    });
  });
});
