import { getZones, getZoneAnalyticsDashboard } from './cloudflare.js';

function extractPublicInfo(data) {
  return {
    since: data.since,
    until: data.until,
    requests: {
      all: data.requests.all,
      cached: data.requests.cached,
      country: data.requests.country,
      status: data.requests.http_status
    },
    bandwidth: {
      all: data.bandwidth.all,
      cached: data.bandwidth.cached,
      country: data.bandwidth.country
    },
    threats: {
      all: data.threats.all,
      country: data.threats.country
    },
    uniques: {
      all: data.uniques.all
    }
  };
}

const DomainNames = ['unpkg.com', 'npmcdn.com'];

export default async function getStats(since, until) {
  const zones = await getZones(DomainNames);
  const dashboard = await getZoneAnalyticsDashboard(zones, since, until);

  return {
    timeseries: dashboard.timeseries.map(extractPublicInfo),
    totals: extractPublicInfo(dashboard.totals)
  };
}
