const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const invariant = require("invariant");
const forge = require("node-forge");

const db = require("./utils/redis");

let keys;
if (process.env.NODE_ENV === "production") {
  keys = {
    public: fs.readFileSync(path.resolve(__dirname, "../public.key"), "utf8"),
    private: process.env.PRIVATE_KEY
  };

  invariant(keys.private, "Missing $PRIVATE_KEY environment variable");
} else {
  // Generate a random keypair for dev/testing.
  // See https://gist.github.com/sebadoom/2b70969e70db5da9a203bebd9cff099f
  const keypair = forge.rsa.generateKeyPair({ bits: 2048 });
  keys = {
    public: forge.pki.publicKeyToPem(keypair.publicKey, 72),
    private: forge.pki.privateKeyToPem(keypair.privateKey, 72)
  };
}

function getCurrentSeconds() {
  return Math.floor(Date.now() / 1000);
}

function createTokenId() {
  return crypto.randomBytes(16).toString("hex");
}

function createToken(scopes = {}) {
  return new Promise((resolve, reject) => {
    const payload = {
      jti: createTokenId(),
      iss: "https://unpkg.com",
      iat: getCurrentSeconds(),
      scopes
    };

    jwt.sign(payload, keys.private, { algorithm: "RS256" }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
}

const revokedTokensSet = "revoked-tokens";

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    const options = { algorithms: ["RS256"] };

    jwt.verify(token, keys.public, options, (error, payload) => {
      if (error) {
        reject(error);
      } else {
        if (payload.jti) {
          db.sismember(revokedTokensSet, payload.jti, (error, value) => {
            if (error) {
              reject(error);
            } else {
              resolve(value === 0 ? payload : null);
            }
          });
        } else {
          resolve(null);
        }
      }
    });
  });
}

function revokeToken(token) {
  return verifyToken(token).then(payload => {
    if (payload) {
      return new Promise((resolve, reject) => {
        db.sadd(revokedTokensSet, payload.jti, error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  });
}

function removeAllRevokedTokens() {
  return new Promise((resolve, reject) => {
    db.del(revokedTokensSet, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function getPublicKey() {
  return keys.public;
}

module.exports = {
  createToken,
  verifyToken,
  revokeToken,
  removeAllRevokedTokens,
  getPublicKey
};
