const AuthAPI = require('../server/AuthAPI');

const scopes = {
  blacklist: {
    read: true
  }
};

AuthAPI.createToken(scopes).then(
  token => {
    // Verify it, just to be sure.
    AuthAPI.verifyToken(token).then(payload => {
      console.log(token, '\n');
      console.log(JSON.stringify(payload, null, 2), '\n');
      console.log(AuthAPI.getPublicKey());
      process.exit();
    });
  },
  error => {
    console.error(error);
    process.exit(1);
  }
);
