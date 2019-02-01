import { revokeToken } from '../../utils/auth';
import withToken from './withToken';

export default function withRevokedToken(scopes, done) {
  withToken(scopes, token => {
    revokeToken(token).then(() => {
      done(token);
    });
  });
}
