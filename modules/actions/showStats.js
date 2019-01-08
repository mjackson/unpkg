const subDays = require('date-fns/sub_days');
const startOfDay = require('date-fns/start_of_day');
const startOfSecond = require('date-fns/start_of_second');

const StatsAPI = require('../StatsAPI');

function showStats(req, res) {
  let since, until;
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
      until = startOfDay(new Date());
      since = subDays(until, 30);
      break;
    default:
      until = req.query.until
        ? new Date(req.query.until)
        : startOfSecond(new Date());
      since = new Date(req.query.since);
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

  StatsAPI.getStats(since, until).then(
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

module.exports = showStats;
