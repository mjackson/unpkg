const AuthAPI = require("../AuthAPI");

const defaultScopes = {
  blacklist: {
    read: true
  }
};

function createAuth(req, res) {
  AuthAPI.createToken(defaultScopes).then(
    token => {
      res.send({ token });
    },
    error => {
      console.error(error);

      res.status(500).send({
        error: "Unable to generate auth token"
      });
    }
  );
}

module.exports = createAuth;
