export default function getStats(since, until) {
  const stats = {
    since: since,
    until: until,
    requests: {
      all: 0,
      cached: 0,
      country: 0,
      status: 0
    },
    bandwidth: {
      all: 0,
      cached: 0,
      country: 0
    },
    threats: {
      all: 0,
      country: 0
    },
    uniques: {
      all: 0
    }
  };

  return Promise.resolve({
    timeseries: [stats],
    totals: stats
  });
}
