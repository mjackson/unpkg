const chalk = require('chalk');

const { getZone, purgeFiles } = require('./utils/cloudflare.js');
const { getFiles } = require('./utils/unpkg.js');

function groupBy(array, n) {
  const groups = [];
  while (array.length) groups.push(array.splice(0, n));
  return groups;
}

async function purgeCache(packageName, version) {
  if (packageName == null) {
    console.error(
      chalk.red(
        'Missing <package-name>; use `node purge-cache.js <package-name> <version>`'
      )
    );

    return 1;
  }

  if (version == null) {
    console.error(
      chalk.red(
        `Missing <version>; use 'node purge-cache.js "${packageName}" <version>'`
      )
    );

    return 1;
  }

  const files = await getFiles(packageName, version);

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
      promise = promise.then(() =>
        purgeFiles(zone.id, group).then(() => {
          group.forEach(url => console.log(chalk.green(`Purged ${url}`)));
        })
      );
    });

    return promise;
  });
}

const packageName = process.argv[2];
const version = process.argv[3];

purgeCache(packageName, version).then(exitCode => {
  process.exit(exitCode);
});
