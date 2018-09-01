const request = require("supertest");

const createServer = require("../createServer");
const withRevokedToken = require("./utils/withRevokedToken");
const withToken = require("./utils/withToken");

describe("The /_auth endpoint", () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe("POST /_auth", () => {
    it("creates a new auth token", done => {
      request(server)
        .post("/_auth")
        .end((err, res) => {
          expect(res.body).toHaveProperty("token");
          done();
        });
    });
  });

  describe("GET /_auth", () => {
    describe("with no auth", () => {
      it("echoes back null", done => {
        request(server)
          .get("/_auth")
          .end((err, res) => {
            expect(res.body).toHaveProperty("auth");
            expect(res.body.auth).toBe(null);
            done();
          });
      });
    });

    describe("with a revoked auth token", () => {
      it("echoes back null", done => {
        withRevokedToken({ some: { scope: true } }, token => {
          request(server)
            .get("/_auth?token=" + token)
            .end((err, res) => {
              expect(res.body).toHaveProperty("auth");
              expect(res.body.auth).toBe(null);
              done();
            });
        });
      });
    });

    describe("with a valid auth token", () => {
      it("echoes back the auth payload", done => {
        withToken({ some: { scope: true } }, token => {
          request(server)
            .get("/_auth?token=" + token)
            .end((err, res) => {
              expect(res.body).toHaveProperty("auth");
              expect(typeof res.body.auth).toBe("object");
              done();
            });
        });
      });
    });
  });
});
