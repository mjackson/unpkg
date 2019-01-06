import { addPackage } from '../../utils/blacklist';

export default function withBlacklist(blacklist, done) {
  Promise.all(blacklist.map(addPackage)).then(done);
}
