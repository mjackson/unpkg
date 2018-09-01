const AuthAPI = require("../AuthAPI");

const ReadMethods = { GET: true, HEAD: true };

function decodeBase64(string) {
  return Buffer.from(string, "base64").toString();
}

/**
 * Sets req.user from the payload in the auth token in the request.
 */
function userToken(req, res, next) {
  if (req.user) {
    return next();
  }

  const auth = req.get("Authorization");
  const token = auth
    ? decodeBase64(auth)
    : (ReadMethods[req.method] ? req.query : req.body).token;

  if (!token) {
    req.user = null;
    return next();
  }

  AuthAPI.verifyToken(token).then(
    payload => {
      req.user = payload;
      next();
    },
    error => {
      if (error.name === "JsonWebTokenError") {
        res.status(403).send({
          error: `Bad auth token: ${error.message}`
        });
      } else {
        console.error(error);

        res.status(500).send({
          error: "Unable to verify auth"
        });
      }
    }
  );
}

module.exports = userToken;
