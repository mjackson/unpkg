const fs = require("fs");
const invariant = require("invariant");

const createBundle = require("../utils/createBundle");

/**
 * An express middleware that sets req.bundle from the build
 * info in the given stats file. Should be used in production.
 */
function staticAssets(webpackStatsFile) {
  let stats;
  try {
    stats = JSON.parse(fs.readFileSync(webpackStatsFile, "utf8"));
  } catch (error) {
    invariant(
      false,
      "staticAssets middleware cannot read the build stats in %s; " +
        "run the `build` script before starting the server",
      webpackStatsFile
    );
  }

  const bundle = createBundle(stats);

  return (req, res, next) => {
    req.bundle = bundle;
    next();
  };
}

module.exports = staticAssets;
