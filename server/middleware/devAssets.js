const invariant = require("invariant");
const createBundle = require("./utils/createBundle");

/**
 * An express middleware that sets req.bundle from the
 * latest result from a running webpack compiler (i.e. using
 * webpack-dev-middleware). Should only be used in dev.
 */
function devAssets(webpackCompiler) {
  let bundle;
  webpackCompiler.plugin("done", stats => {
    bundle = createBundle(stats.toJson());
  });

  return (req, res, next) => {
    invariant(
      bundle != null,
      "devAssets middleware needs a running compiler; " +
        "use webpack-dev-middleware in front of devAssets"
    );

    req.bundle = bundle;

    next();
  };
}

module.exports = devAssets;
