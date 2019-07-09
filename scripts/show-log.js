const { getZone, getLog } = require('./utils/cloudflare.js');

async function run(rayId) {
  if (rayId == null) {
    console.error('Missing the RAY_ID argument; use `node show-log.js RAY_ID`');
    return 1;
  }

  const zone = await getZone('unpkg.com');
  const entry = await getLog(zone.id, rayId);

  console.log(entry || 'NOT FOUND');
  return 0;
}

const rayId = process.argv[2];

run(rayId).then(exitCode => {
  process.exit(exitCode);
});
