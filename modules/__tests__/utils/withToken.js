import { createToken } from '../../utils/auth';

export default function withToken(scopes, done) {
  createToken(scopes).then(done);
}
