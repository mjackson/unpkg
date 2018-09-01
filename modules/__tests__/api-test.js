const request = require("supertest");

const createServer = require("../createServer");

const clearBlacklist = require("./utils/clearBlacklist");
const withRevokedToken = require("./utils/withRevokedToken");
const withToken = require("./utils/withToken");

describe("The API server", () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  describe("GET /api/publicKey", () => {
    it("echoes the public key", done => {
      request(server)
        .get("/api/publicKey")
        .end((err, res) => {
          expect(res.text).toMatch(/PUBLIC KEY/);
          done();
        });
    });
  });

  // TODO: Remove
  describe("GET /_publicKey", () => {
    it("echoes the public key", done => {
      request(server)
        .get("/_publicKey")
        .end((err, res) => {
          expect(res.text).toMatch(/PUBLIC KEY/);
          done();
        });
    });
  });

  describe("POST /api/auth", () => {
    it("creates a new auth token", done => {
      request(server)
        .post("/api/auth")
        .end((err, res) => {
          expect(res.body).toHaveProperty("token");
          done();
        });
    });
  });

  // TODO: Remove
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

  describe("GET /api/auth", () => {
    describe("with no auth", () => {
      it("echoes back null", done => {
        request(server)
          .get("/api/auth")
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
            .get("/api/auth?token=" + token)
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
            .get("/api/auth?token=" + token)
            .end((err, res) => {
              expect(res.body).toHaveProperty("auth");
              expect(typeof res.body.auth).toBe("object");
              done();
            });
        });
      });
    });
  });

  // TODO: Remove
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

  describe("POST /api/blacklist", () => {
    afterEach(clearBlacklist);

    describe("with no auth", () => {
      it("is forbidden", done => {
        request(server)
          .post("/api/blacklist")
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.add" scope', () => {
      it("can add to the blacklist", done => {
        withToken({ blacklist: { add: true } }, token => {
          request(server)
            .post("/api/blacklist")
            .send({ token, packageName: "bad-package" })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });
    });
  });

  // TODO: Remove
  describe("POST /_blacklist", () => {
    afterEach(clearBlacklist);

    describe("with no auth", () => {
      it("is forbidden", done => {
        request(server)
          .post("/_blacklist")
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.add" scope', () => {
      it("can add to the blacklist", done => {
        withToken({ blacklist: { add: true } }, token => {
          request(server)
            .post("/_blacklist")
            .send({ token, packageName: "bad-package" })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });
    });
  });

  describe("GET /api/blacklist", () => {
    describe("with no auth", () => {
      it("is forbidden", done => {
        request(server)
          .get("/api/blacklist")
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.read" scope', () => {
      it("can read the blacklist", done => {
        withToken({ blacklist: { read: true } }, token => {
          request(server)
            .get("/api/blacklist?token=" + token)
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              done();
            });
        });
      });
    });
  });

  // TODO: Remove
  describe("GET /_blacklist", () => {
    describe("with no auth", () => {
      it("is forbidden", done => {
        request(server)
          .get("/_blacklist")
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.read" scope', () => {
      it("can read the blacklist", done => {
        withToken({ blacklist: { read: true } }, token => {
          request(server)
            .get("/_blacklist?token=" + token)
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              done();
            });
        });
      });
    });
  });

  describe("DELETE /api/blacklist", () => {
    describe("with no auth", () => {
      it("is forbidden", done => {
        request(server)
          .delete("/api/blacklist")
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.remove" scope', () => {
      it("can remove a package from the blacklist", done => {
        withToken({ blacklist: { remove: true } }, token => {
          request(server)
            .delete("/api/blacklist")
            .send({ token, packageName: "bad-package" })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });

      it("can remove a scoped package from the blacklist", done => {
        withToken({ blacklist: { remove: true } }, token => {
          request(server)
            .delete("/api/blacklist")
            .send({ token, packageName: "@scope/bad-package" })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });
    });
  });

  // TODO: Remove
  describe("DELETE /_blacklist/:packageName", () => {
    describe("with no auth", () => {
      it("is forbidden", done => {
        request(server)
          .delete("/_blacklist/bad-package")
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });

    describe('with the "blacklist.remove" scope', () => {
      it("can remove a package from the blacklist", done => {
        withToken({ blacklist: { remove: true } }, token => {
          request(server)
            .delete("/_blacklist/bad-package")
            .send({ token })
            .end((err, res) => {
              expect(res.statusCode).toBe(200);
              expect(res.body.ok).toBe(true);
              done();
            });
        });
      });

      it("can remove a scoped package from the blacklist", done => {
        withToken({ blacklist: { remove: true } }, token => {
          request(server)
            .delete("/_blacklist/@scope/bad-package")
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
