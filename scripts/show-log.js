const { getZones, getLog } = require('./utils/cloudflare');
const { die } = require('./utils/process');

const RayId = process.argv[2];

if (RayId == null) {
  die('Missing the RAY_ID argument; use `node show-log.js RAY_ID`');
}

getZone('unpkg.com').then(zone => {
  getLog(zone.id, RayId).then(entry => {
    console.log(entry || 'NOT FOUND');
  });
});
