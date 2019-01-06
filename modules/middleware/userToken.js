import { verifyToken } from '../utils/auth';

function decodeBase64(string) {
  return Buffer.from(string, 'base64').toString();
}

/**
 * Sets req.user from the payload in the auth token in the request.
 */
export default function userToken(req, res, next) {
  if (req.user !== undefined) {
    return next();
  }

  const auth = req.get('Authorization');
  const token = auth && decodeBase64(auth);

  if (!token) {
    req.user = null;
    return next();
  }

  verifyToken(token).then(
    payload => {
      req.user = payload;
      next();
    },
    error => {
      if (error.name === 'JsonWebTokenError') {
        res.status(403).send({
          error: `Bad auth token: ${error.message}`
        });
      } else {
        console.error(error);

        res.status(500).send({
          error: 'Unable to verify auth'
        });
      }
    }
  );
}
