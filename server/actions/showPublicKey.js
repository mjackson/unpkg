const secretKey = require("../secretKey");

function showPublicKey(req, res) {
  res.send({ publicKey: secretKey.public });
}

module.exports = showPublicKey;
