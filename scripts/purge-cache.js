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

    return getZone('unpkg.com').then(zone => {
      let promise = Promise.resolve();

      groupBy(files, 30).forEach(group => {
        promise = promise.then(() => {
          const urls = group.map(
            file => `https://unpkg.com/${packageName}@${version}${file.path}`
          );

          return purgeFiles(zone.id, urls).then(data => {
            group.forEach(file =>
              console.log(chalk.green(`Purged ${file.path}`))
            );
          });
        });
      });

      return promise;
    });
  })
  .catch(die);
