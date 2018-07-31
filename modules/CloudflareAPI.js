require("isomorphic-fetch");
const invariant = require("invariant");
const gunzip = require("gunzip-maybe");
const ndjson = require("ndjson");

const cloudflareURL = "https://api.cloudflare.com/client/v4";
const cloudflareEmail = process.env.CLOUDFLARE_EMAIL;
const cloudflareKey = process.env.CLOUDFLARE_KEY;

invariant(
  cloudflareEmail,
  "Missing the $CLOUDFLARE_EMAIL environment variable"
);

invariant(cloudflareKey, "Missing the $CLOUDFLARE_KEY environment variable");

function get(path, headers) {
  return fetch(`${cloudflareURL}${path}`, {
    headers: Object.assign({}, headers, {
      "X-Auth-Email": cloudflareEmail,
      "X-Auth-Key": cloudflareKey
    })
  });
}

function getJSON(path, headers) {
  return get(path, headers)
    .then(res => {
      return res.json();
    })
    .then(data => {
      if (!data.success) {
        console.error(`CloudflareAPI.getJSON failed at ${path}`);
        console.error(data);
        throw new Error("Failed to getJSON from Cloudflare");
      }

      return data.result;
    });
}

function getZones(domains) {
  return Promise.all(
    (Array.isArray(domains) ? domains : [domains]).map(domain =>
      getJSON(`/zones?name=${domain}`)
    )
  ).then(results => results.reduce((memo, zones) => memo.concat(zones)));
}

function reduceResults(target, values) {
  Object.keys(values).forEach(key => {
    const value = values[key];

    if (typeof value === "object" && value) {
      target[key] = reduceResults(target[key] || {}, value);
    } else if (typeof value === "number") {
      target[key] = (target[key] || 0) + values[key];
    }
  });

  return target;
}

function getZoneAnalyticsDashboard(zones, since, until) {
  return Promise.all(
    (Array.isArray(zones) ? zones : [zones]).map(zone => {
      return getJSON(
        `/zones/${
          zone.id
        }/analytics/dashboard?since=${since.toISOString()}&until=${until.toISOString()}`
      );
    })
  ).then(results => results.reduce(reduceResults));
}

function getJSONStream(path, headers) {
  const gzipHeaders = Object.assign({}, headers, {
    "Accept-Encoding": "gzip"
  });

  return get(path, gzipHeaders)
    .then(res => res.body.pipe(gunzip()))
    .then(stream => stream.pipe(ndjson.parse()));
}

function getLogs(zoneId, startTime, endTime, fieldsArray) {
  const fields = fieldsArray.join(",");

  // console.log(
  //   `https://api.cloudflare.com/client/v4/zones/${zoneId}/logs/received?start=${startTime}&end=${endTime}&fields=${fields}`
  // );

  return getJSONStream(
    `/zones/${zoneId}/logs/received?start=${startTime}&end=${endTime}&fields=${fields}`
  );
}

module.exports = {
  get,
  getJSON,
  getZones,
  getZoneAnalyticsDashboard,
  getJSONStream,
  getLogs
};
