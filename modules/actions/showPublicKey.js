import secretKey from '../secretKey';

export default function showPublicKey(req, res) {
  res.send({ publicKey: secretKey.public });
}
