const fs = require('fs');
const path = require('path');
const forge = require('node-forge');
const invariant = require('invariant');

let secretKey;
if (process.env.NODE_ENV === 'production') {
  invariant(
    process.env.PRIVATE_KEY,
    'Missing $PRIVATE_KEY environment variable'
  );

  secretKey = {
    public: fs.readFileSync(
      path.resolve(__dirname, '../secret_key.pub'),
      'utf8'
    ),
    private: process.env.PRIVATE_KEY
  };
} else {
  // Generate a random keypair for dev/testing.
  // See https://gist.github.com/sebadoom/2b70969e70db5da9a203bebd9cff099f
  const keypair = forge.rsa.generateKeyPair({ bits: 2048 });

  secretKey = {
    public: forge.pki.publicKeyToPem(keypair.publicKey, 72),
    private: forge.pki.privateKeyToPem(keypair.privateKey, 72)
  };
}

module.exports = secretKey;
