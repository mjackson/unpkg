/**
 * An express middleware that sets req.manifest from the build manifest
 * in the given file. Should be used in production together with
 * https://github.com/soundcloud/chunk-manifest-webpack-plugin
 * to get consistent hashes.
 */
function assetsManifest(webpackManifestFile) {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(webpackManifestFile, "utf8"));
  } catch (error) {
    invariant(
      false,
      'assetsManifest middleware cannot read the manifest file "%s"; ' +
        "run `yarn build` before starting the server",
      webpackManifestFile
    );
  }

  return (req, res, next) => {
    req.manifest = manifest;
    next();
  };
}

module.exports = assetsManifest;
