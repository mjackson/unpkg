const invariant = require("invariant");

const createAssets = require("./utils/createAssets");

/**
 * An express middleware that sets req.assets from the
 * latest result from a running webpack compiler (i.e. using
 * webpack-dev-middleware). Should only be used in dev.
 */
function devAssets(webpackCompiler) {
  let assets;
  webpackCompiler.plugin("done", stats => {
    assets = createAssets(stats.toJson());
  });

  return (req, res, next) => {
    invariant(
      assets != null,
      "devAssets middleware needs a running compiler; " +
        "use webpack-dev-middleware in front of devAssets"
    );

    req.assets = assets;

    next();
  };
}

module.exports = devAssets;
