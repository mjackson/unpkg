import { publicKey } from '../utils/secret';

export default function servePublicKey(req, res) {
  res.send({ publicKey });
}
