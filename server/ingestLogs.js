const parseURL = require("url").parse;
const startOfDay = require("date-fns/start_of_day");
const startOfMinute = require("date-fns/start_of_minute");
const addDays = require("date-fns/add_days");

const db = require("./utils/redis");
const isValidPackageName = require("./utils/isValidPackageName");
const parsePackageURL = require("./utils/parsePackageURL");

const CloudflareAPI = require("./CloudflareAPI");
const StatsAPI = require("./StatsAPI");

/**
 * Domains we want to analyze.
 */
const domainNames = [
  "unpkg.com"
  //"npmcdn.com" // We don't have log data on npmcdn.com yet :/
];

/**
 * The window of time to download in a single fetch.
 */
const logWindowSeconds = 30;

/**
 * The minimum time to wait between fetches.
 */
const minInterval = 15000;

function getSeconds(date) {
  return Math.floor(date.getTime() / 1000);
}

function stringifySeconds(seconds) {
  return new Date(seconds * 1000).toISOString().replace(/\.0+Z$/, "Z");
}

function toSeconds(ms) {
  return Math.floor(ms / 1000);
}

const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;

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
      .on("error", reject)
      .on("data", entry => {
        totalEntries += 1;

        const date = new Date(Math.round(entry.EdgeStartTimestamp / 1000000));

        const nextDay = startOfDay(addDays(date, 1));
        const sevenDaysLater = getSeconds(addDays(nextDay, 7));
        const thirtyDaysLater = getSeconds(addDays(nextDay, 30));
        const dayKey = StatsAPI.createDayKey(date);

        if (entry.EdgeResponseStatus === 200) {
          // Q: How many requests do we serve for a package per day?
          // Q: How many bytes do we serve for a package per day?
          const url = parsePackageURL(entry.ClientRequestURI);
          const packageName = url && url.packageName;

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
        const hostname = referer && parseURL(referer).hostname;

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
      .on("end", () => {
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
          db.zincrby(key, values[member], member);
        });

        if (expireat[key]) {
          db.expireat(key, expireat[key]);
        }
      });

      return totalEntries;
    }
  );
}

function ingestLogs(zone, startSeconds, endSeconds) {
  const startFetchTime = Date.now();
  const fields = [
    "EdgeStartTimestamp",
    "EdgeResponseStatus",
    "EdgeResponseBytes",
    "ClientRequestProtocol",
    "ClientRequestURI",
    "ClientRequestReferer"
  ];

  return CloudflareAPI.getLogs(
    zone.id,
    stringifySeconds(startSeconds),
    stringifySeconds(endSeconds),
    fields
  ).then(stream => {
    const endFetchTime = Date.now();

    console.log(
      "info: Fetched logs for %s from %s to %s (%dms)",
      zone.name,
      stringifySeconds(startSeconds),
      stringifySeconds(endSeconds),
      endFetchTime - startFetchTime
    );

    const startProcessTime = Date.now();

    return processLogs(stream).then(totalEntries => {
      const endProcessTime = Date.now();

      console.log(
        "info: Processed %d log entries for %s (%dms)",
        totalEntries,
        zone.name,
        endProcessTime - startProcessTime
      );
    });
  });
}

function startZone(zone) {
  const suffix = zone.name.replace(".", "-");
  const startSecondsKey = `ingestLogs-start-${suffix}`;

  function takeATurn() {
    const now = Date.now();

    // Cloudflare keeps logs around for 7 days.
    // https://support.cloudflare.com/hc/en-us/articles/216672448-Enterprise-Log-Share-Logpull-REST-API
    const minSeconds = toSeconds(startOfMinute(now - oneDay * 5));

    db.get(startSecondsKey, (error, value) => {
      let startSeconds = value && parseInt(value, 10);

      if (startSeconds == null) {
        startSeconds = minSeconds;
      } else if (startSeconds < minSeconds) {
        console.warn(
          "warning: Dropped logs for %s from %s to %s!",
          zone.name,
          stringifySeconds(startSeconds),
          stringifySeconds(minSeconds)
        );

        startSeconds = minSeconds;
      }

      const endSeconds = startSeconds + logWindowSeconds;

      // The log for a request is typically available within thirty (30) minutes
      // of the request taking place under normal conditions. We deliver logs
      // ordered by the time that the logs were created, i.e. the timestamp of
      // the request when it was received by the edge. Given the order of
      // delivery, we recommend waiting a full thirty minutes to ingest a full
      // set of logs. This will help ensure that any congestion in the log
      // pipeline has passed and a full set of logs can be ingested.
      // https://support.cloudflare.com/hc/en-us/articles/216672448-Enterprise-Log-Share-REST-API
      const maxSeconds = toSeconds(now - oneMinute * 30);

      if (endSeconds < maxSeconds) {
        ingestLogs(zone, startSeconds, endSeconds).then(
          () => {
            db.set(startSecondsKey, endSeconds);
            setTimeout(takeATurn, minInterval);
          },
          error => {
            console.error(error.stack);
            process.exit(1);
          }
        );
      } else {
        setTimeout(takeATurn, (startSeconds - maxSeconds) * 1000);
      }
    });
  }

  takeATurn();
}

Promise.all(domainNames.map(CloudflareAPI.getZones)).then(results => {
  const zones = results.reduce((memo, zones) => memo.concat(zones));
  zones.forEach(startZone);
});
