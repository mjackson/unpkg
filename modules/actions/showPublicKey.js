import { secretKey } from '../config';

export default function showPublicKey(req, res) {
  res.send({ publicKey: secretKey.public });
}
