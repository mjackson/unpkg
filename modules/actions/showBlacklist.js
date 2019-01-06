import { getPackages } from '../utils/blacklist';

export default function showBlacklist(req, res) {
  getPackages().then(
    blacklist => {
      res.send({ blacklist });
    },
    error => {
      console.error(error);
      res.status(500).send({
        error: 'Unable to fetch blacklist'
      });
    }
  );
}
