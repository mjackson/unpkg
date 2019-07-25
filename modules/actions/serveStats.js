import { subDays, startOfDay } from 'date-fns';

import getStats from '../utils/getStats.js';

export default function serveStats(req, res) {
  let since, until;
  if (req.query.period) {
    switch (req.query.period) {
      case 'last-day':
        until = startOfDay(new Date());
        since = subDays(until, 1);
        break;
      case 'last-week':
        until = startOfDay(new Date());
        since = subDays(until, 7);
        break;
      case 'last-month':
      default:
        until = startOfDay(new Date());
        since = subDays(until, 30);
    }
  } else {
    until = req.query.until
      ? new Date(req.query.until)
      : startOfDay(new Date());
    since = req.query.since ? new Date(req.query.since) : subDays(until, 1);
  }

  if (isNaN(since.getTime())) {
    return res.status(403).send({ error: '?since is not a valid date' });
  }

  if (isNaN(until.getTime())) {
    return res.status(403).send({ error: '?until is not a valid date' });
  }

  if (until <= since) {
    return res
      .status(403)
      .send({ error: '?until date must come after ?since date' });
  }

  if (until >= new Date()) {
    return res.status(403).send({ error: '?until must be a date in the past' });
  }

  getStats(since, until).then(
    stats => {
      res
        .set({
          'Cache-Control': 'public, max-age=3600', // 1 hour
          'Cache-Tag': 'stats'
        })
        .send(stats);
    },
    error => {
      console.error(error);
      res.status(500).send({ error: 'Unable to fetch stats' });
    }
  );
}
