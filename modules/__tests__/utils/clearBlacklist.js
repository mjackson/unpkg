import { removeAllPackages } from '../../utils/blacklist';

export default function clearBlacklist(done) {
  removeAllPackages().then(done, done);
}
