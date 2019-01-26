import url from 'url';
import { startOfDay, addDays } from 'date-fns';

import data from './data';
import isValidPackageName from './isValidPackageName';
import parsePackageURL from './parsePackageURL';
import * as cloudflare from './cloudflare';
import * as stats from './stats';

/**
 * Domains we want to analyze.
 */
const domainNames = [
  'unpkg.com'
  //"npmcdn.com" // We don't have log data on npmcdn.com yet :/
];

let cachedZones;

function getSeconds(date) {
  return Math.floor(date.getTime() / 1000);
}

function stringifySeconds(seconds) {
  return new Date(seconds * 1000).toISOString().replace(/\.0+Z$/, 'Z');
}

function toSeconds(ms) {
  return Math.floor(ms / 1000);
}

function computeCounters(stream) {
  return new Promise((resolve, reject) => {
    const counters = {};
    const expireat = {};
    let totalEntries = 0;

    function incr(key, member, by, expiry) {
      counters[key] = counters[key] || {};
      counters[key][member] = (counters[key][member] || 0) + by;
      expireat[key] = expiry;
    }

    stream
      .on('error', reject)
      .on('data', entry => {
        totalEntries += 1;

        const date = new Date(Math.round(entry.EdgeStartTimestamp / 1000000));

        const nextDay = startOfDay(addDays(date, 1));
        const sevenDaysLater = getSeconds(addDays(nextDay, 7));
        const thirtyDaysLater = getSeconds(addDays(nextDay, 30));
        const dayKey = stats.createDayKey(date);

        if (entry.EdgeResponseStatus === 200) {
          // Q: How many requests do we serve for a package per day?
          // Q: How many bytes do we serve for a package per day?
          const parsed = parsePackageURL(entry.ClientRequestURI);
          const packageName = parsed && parsed.packageName;

          if (packageName && isValidPackageName(packageName)) {
            incr(
              `stats-packageRequests-${dayKey}`,
              packageName,
              1,
              thirtyDaysLater
            );
            incr(
              `stats-packageBytes-${dayKey}`,
              packageName,
              entry.EdgeResponseBytes,
              thirtyDaysLater
            );
          }
        }

        // Q: How many requests per day do we receive via a protocol?
        const protocol = entry.ClientRequestProtocol;

        if (protocol) {
          incr(
            `stats-protocolRequests-${dayKey}`,
            protocol,
            1,
            thirtyDaysLater
          );
        }

        // Q: How many requests do we receive from a hostname per day?
        // Q: How many bytes do we serve to a hostname per day?
        const referer = entry.ClientRequestReferer;
        const hostname = referer && url.parse(referer).hostname;

        if (hostname) {
          incr(`stats-hostnameRequests-${dayKey}`, hostname, 1, sevenDaysLater);
          incr(
            `stats-hostnameBytes-${dayKey}`,
            hostname,
            entry.EdgeResponseBytes,
            sevenDaysLater
          );
        }
      })
      .on('end', () => {
        resolve({ counters, expireat, totalEntries });
      });
  });
}

function processLogs(stream) {
  return computeCounters(stream).then(
    ({ counters, expireat, totalEntries }) => {
      Object.keys(counters).forEach(key => {
        const values = counters[key];

        Object.keys(values).forEach(member => {
          data.zincrby(key, values[member], member);
        });

        if (expireat[key]) {
          data.expireat(key, expireat[key]);
        }
      });

      return totalEntries;
    }
  );
}

function ingestLogsForZone(zone, startDate, endDate) {
  const startSeconds = toSeconds(startDate);
  const endSeconds = toSeconds(endDate);

  const startFetchTime = Date.now();
  const fields = [
    'EdgeStartTimestamp',
    'EdgeResponseStatus',
    'EdgeResponseBytes',
    'ClientRequestProtocol',
    'ClientRequestURI',
    'ClientRequestReferer'
  ];

  return cloudflare
    .getLogs(
      zone.id,
      stringifySeconds(startSeconds),
      stringifySeconds(endSeconds),
      fields
    )
    .then(stream => {
      const endFetchTime = Date.now();

      console.log(
        'Fetched logs for %s from %s to %s (%dms)',
        zone.name,
        stringifySeconds(startSeconds),
        stringifySeconds(endSeconds),
        endFetchTime - startFetchTime
      );

      const startProcessTime = Date.now();

      return processLogs(stream).then(totalEntries => {
        const endProcessTime = Date.now();

        console.log(
          'Processed %d log entries for %s (%dms)',
          totalEntries,
          zone.name,
          endProcessTime - startProcessTime
        );
      });
    });
}

function getZones(domainNames) {
  return Promise.all(domainNames.map(cloudflare.getZones)).then(results =>
    results.reduce((memo, zones) => memo.concat(zones))
  );
}

export default function ingestLogs(startDate, endDate) {
  return Promise.resolve(cachedZones || getZones(domainNames)).then(zones => {
    if (!cachedZones) cachedZones = zones;

    return Promise.all(
      zones.map(zone => ingestLogsForZone(zone, startDate, endDate))
    );
  });
}
