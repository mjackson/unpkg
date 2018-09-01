const request = require("supertest");

const createServer = require("../createServer");

const clearBlacklist = require("./utils/clearBlacklist");
const withBlacklist = require("./utils/withBlacklist");

describe("The server", () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it("redirects /_meta to ?meta", done => {
    request(server)
      .get("/_meta/react")
      .end((err, res) => {
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe("/react?meta");
        done();
      });
  });

  it("redirects ?json to ?meta", done => {
    request(server)
      .get("/react?json")
      .end((err, res) => {
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe("/react?meta");
        done();
      });
  });

  it("redirects invalid query params", done => {
    request(server)
      .get("/react?main=index&invalid")
      .end((err, res) => {
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe("/react?main=index");
        done();
      });
  });

  it("rejects invalid package names", done => {
    request(server)
      .get("/_invalid/index.js")
      .end((err, res) => {
        expect(res.statusCode).toBe(403);
        done();
      });
  });

  describe("blacklisted packages", () => {
    afterEach(clearBlacklist);

    it("does not serve blacklisted packages", done => {
      withBlacklist(["bad-package"], () => {
        request(server)
          .get("/bad-package/index.js")
          .end((err, res) => {
            expect(res.statusCode).toBe(403);
            done();
          });
      });
    });
  });
});
