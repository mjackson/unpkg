import { createToken } from '../utils/auth';

const defaultScopes = {};

export default function createAuth(req, res) {
  createToken(defaultScopes).then(
    token => {
      res.send({ token });
    },
    error => {
      console.error(error);

      res.status(500).send({
        error: 'Unable to generate auth token'
      });
    }
  );
}
