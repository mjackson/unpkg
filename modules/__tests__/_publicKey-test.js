const request = require("supertest");

const createServer = require("../createServer");

describe("The /_publicKey endpoint", () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

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
});
