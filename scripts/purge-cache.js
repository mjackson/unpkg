const chalk = require('chalk');

const { getZone, purgeFiles } = require('./utils/cloudflare');
const { die } = require('./utils/process');
const { getFiles } = require('./utils/unpkg');

const packageName = process.argv[2];
const version = process.argv[3];

if (packageName == null) {
  die(
    'Missing the PACKAGE_NAME argument; use `node purge-cache.js PACKAGE_NAME VERSION`'
  );
}

if (version == null) {
  die(
    'Missing the VERSION argument; use `node purge-cache.js PACKAGE_NAME VERSION`'
  );
}

function groupBy(array, n) {
  const groups = [];

  while (array.length) {
    groups.push(array.splice(0, n));
  }

  return groups;
}

getFiles(packageName, version)
  .then(files => {
    console.log(
      chalk.yellow(
        `Found ${files.length} files for package ${packageName}@${version}`
      )
    );

    let urls = files.map(
      file => `https://unpkg.com/${packageName}@${version}${file.path}`
    );

    if (version === 'latest') {
      // Purge the URL w/out the "@latest" too.
      urls = urls.concat(
        files.map(file => `https://unpkg.com/${packageName}${file.path}`)
      );
    }

    return getZone('unpkg.com').then(zone => {
      let promise = Promise.resolve();

      groupBy(urls, 30).forEach(group => {
        promise = promise.then(() => {
          return purgeFiles(zone.id, group).then(data => {
            group.forEach(url => console.log(chalk.green(`Purged ${url}`)));
          });
        });
      });

      return promise;
    });
  })
  .catch(die);
