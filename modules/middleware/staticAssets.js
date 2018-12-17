const fs = require('fs');
const invariant = require('invariant');

const createAssets = require('./utils/createAssets');

/**
 * An express middleware that sets req.assets from the build
 * info in the given stats file. Should be used in production.
 */
function staticAssets(webpackStatsFile) {
  let stats;
  try {
    stats = JSON.parse(fs.readFileSync(webpackStatsFile, 'utf8'));
  } catch (error) {
    invariant(
      false,
      'staticAssets middleware cannot read the build stats in %s; ' +
        'run the `build` script before starting the server',
      webpackStatsFile
    );
  }

  const assets = createAssets(stats);

  return (req, res, next) => {
    req.assets = assets;
    next();
  };
}

module.exports = staticAssets;
