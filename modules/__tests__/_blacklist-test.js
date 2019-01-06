import request from 'supertest';

import createServer from '../createServer';
import clearBlacklist from './utils/clearBlacklist';
import withToken from './utils/withToken';

describe('The /_blacklist endpoint', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe('POST /_blacklist', () => {
    afterEach(clearBlacklist);

    describe('with no auth', () => {
      it('is forbidden', done => {
        request(server)
          .post('/_blacklist')
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.add" scope', () => {
      it('can add to the blacklist', done => {
        withToken({ blacklist: { add: true } }, token => {
          request(server)
            .post('/_blacklist')
            .send({ token, packageName: 'bad-package' })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });
    });
  });

  describe('GET /_blacklist', () => {
    describe('with no auth', () => {
      it('is forbidden', done => {
        request(server)
          .get('/_blacklist')
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.read" scope', () => {
      it('can read the blacklist', done => {
        withToken({ blacklist: { read: true } }, token => {
          request(server)
            .get('/_blacklist?token=' + token)
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              done();
            });
        });
      });
    });
  });

  describe('DELETE /_blacklist/:packageName', () => {
    describe('with no auth', () => {
      it('is forbidden', done => {
        request(server)
          .delete('/_blacklist/bad-package')
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.remove" scope', () => {
      it('can remove a package from the blacklist', done => {
        withToken({ blacklist: { remove: true } }, token => {
          request(server)
            .delete('/_blacklist/bad-package')
            .send({ token })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });

      it('can remove a scoped package from the blacklist', done => {
        withToken({ blacklist: { remove: true } }, token => {
          request(server)
            .delete('/_blacklist/@scope/bad-package')
            .send({ token })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });
    });
  });
});
