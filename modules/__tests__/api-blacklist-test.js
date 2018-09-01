const request = require("supertest");

const createServer = require("../createServer");
const clearBlacklist = require("./utils/clearBlacklist");
const withToken = require("./utils/withToken");

describe("The /api/blacklist endpoint", () => {
  let server;
  beforeEach(() => {
    server = createServer();
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
});
