const fetch = require('isomorphic-fetch');

const CloudflareEmail = process.env.CLOUDFLARE_EMAIL;
const CloudflareKey = process.env.CLOUDFLARE_KEY;

if (CloudflareEmail == null) {
  console.error('Missing the $CLOUDFLARE_EMAIL environment variable');
  process.exit(1);
}

if (CloudflareKey == null) {
  console.error('Missing the $CLOUDFLARE_KEY environment variable');
  process.exit(1);
}

function get(path) {
  return fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': CloudflareEmail,
      'X-Auth-Key': CloudflareKey
    }
  });
}

function getLog(zoneId, rayId) {
  return get(`/zones/${zoneId}/logs/requests/${rayId}`).then(
    res => (res.status === 404 ? null : res.json())
  );
}

function getZone(domain) {
  return get(`/zones?name=${domain}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw data;

      const zones = data.result;

      if (zones.length > 1) {
        console.error(
          `Domain "${domain}" has more than one zone: ${zones.join(', ')}`
        );
      }

      return zones[0];
    });
}

function post(path, data) {
  const options = {
    method: 'POST',
    headers: {
      'X-Auth-Email': CloudflareEmail,
      'X-Auth-Key': CloudflareKey
    }
  };

  if (data) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  return fetch(`https://api.cloudflare.com/client/v4${path}`, options);
}

function purgeFiles(zoneId, files) {
  return post(`/zones/${zoneId}/purge_cache`, { files })
    .then(res => res.json())
    .then(data => {
      if (data.success) return data;
      throw data;
    });
}

function purgeTags(zoneId, tags) {
  return post(`/zones/${zoneId}/purge_cache`, { tags })
    .then(res => res.json())
    .then(data => {
      if (data.success) return data;
      throw data;
    });
}

module.exports = {
  getLog,
  getZone,
  purgeFiles,
  purgeTags
};
