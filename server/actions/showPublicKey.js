const AuthAPI = require("../AuthAPI");

function showPublicKey(req, res) {
  res.send({ publicKey: AuthAPI.getPublicKey() });
}

module.exports = showPublicKey;
