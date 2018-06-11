const fs = require("fs");
const path = require("path");

const createPackageURL = require("../utils/createPackageURL");
const createSearch = require("../utils/createSearch");
const incrementCounter = require("../utils/incrementCounter");

/**
 * File extensions to look for when automatically resolving.
 */
const resolveExtensions = ["", ".js", ".json"];

/**
 * Resolves a path like "lib/file" into "lib/file.js" or "lib/file.json"
 * depending on which one is available, similar to require('lib/file').
 */
function resolveFile(base, useIndex, callback) {
  resolveExtensions.reduceRight((next, ext) => {
    const file = base + ext;

    return () => {
      fs.stat(file, (error, stats) => {
        if (error) {
          if (error.code === "ENOENT" || error.code === "ENOTDIR") {
            next();
          } else {
            callback(error);
          }
        } else if (useIndex && stats.isDirectory()) {
          resolveFile(
            path.join(file, "index"),
            false,
            (error, indexFile, indexStats) => {
              if (error) {
                callback(error);
              } else if (indexFile) {
                callback(null, indexFile, indexStats);
              } else {
                next();
              }
            }
          );
        } else {
          callback(null, file, stats);
        }
      });
    };
  }, callback)();
}

function getBasename(file) {
  return path.basename(file, path.extname(file));
}

/**
 * Find the file targeted by the request and get its stats. Redirect
 * inexact paths in ?module mode so relative imports resolve correctly.
 */
function findFile(req, res, next) {
  let filename = req.filename;
  let useIndex = true;

  if (req.query.module != null) {
    // They want an ES module.
    if (!filename) {
      // See https://github.com/rollup/rollup/wiki/pkg.module
      filename =
        req.packageConfig.module || req.packageConfig["jsnext:main"] || "/";
    }
  } else if (filename) {
    // They are requesting an explicit filename. Only try to find an
    // index.js if they are NOT requesting an index page.
    useIndex = filename.charAt(filename.length - 1) !== "/";
  } else if (
    req.query.main &&
    typeof req.packageConfig[req.query.main] === "string"
  ) {
    // They specified a custom ?main field.
    // Deprecated, see https://github.com/unpkg/unpkg/issues/63
    filename = req.packageConfig[req.query.main];

    // Count which packages are using this so we can warn them when we
    // remove this functionality.
    incrementCounter(
      "package-json-custom-main",
      req.packageSpec + "?main=" + req.query.main,
      1
    );
  } else if (typeof req.packageConfig.unpkg === "string") {
    // The "unpkg" field allows packages to explicitly declare the
    // file to serve at the bare URL.
    filename = req.packageConfig.unpkg;
  } else if (typeof req.packageConfig.unpkg === "object") {
    // The "unpkg" field can also be an object specifying a more
    // advanced configuration. The "bundles" field is used to
    // specify different entry points for the same package.
    const bundles = req.packageConfig.unpkg.bundles;
    if (typeof bundles === "object") {
      // Use the `bundle` get parameter. Fall back to the default
      // bundle if the parameter is not present.
      const requestedBundle = req.query.bundle || "default";
      // Check if the requested bundle exists
      // If it doesn't exist in the available bundles, fall back
      // to the default one.
      filename = bundles[requestedBundle] || bundles.default;
    }
  } else if (typeof req.packageConfig.browser === "string") {
    // Fall back to the "browser" field if declared (only support strings).
    // Deprecated, see https://github.com/unpkg/unpkg/issues/63
    filename = req.packageConfig.browser;

    // Count which packages + versions are actually using this fallback
    // so we can warn them when we deprecate this functionality.
    incrementCounter("package-json-browser-fallback", req.packageSpec, 1);
  }
  if (!filename) {
    // Fall back to "main" or / (same as npm).
    filename = req.packageConfig.main || "/";
  }

  resolveFile(
    path.join(req.packageDir, filename),
    useIndex,
    (error, file, stats) => {
      if (error) console.error(error);

      if (file == null) {
        return res
          .status(404)
          .type("text")
          .send(
            `Cannot find module "${filename}" in package ${req.packageSpec}`
          );
      }

      filename = file.replace(req.packageDir, "");

      if (req.query.main != null) {
        // Permanently redirect ?main requests to their exact files.
        // Deprecated, see https://github.com/unpkg/unpkg/issues/63
        delete req.query.main;

        return res.redirect(
          301,
          createPackageURL(
            req.packageName,
            req.packageVersion,
            filename,
            createSearch(req.query)
          )
        );
      }

      if (getBasename(req.filename) !== getBasename(filename)) {
        // Redirect to the exact file so relative imports resolve correctly.
        // Cache module redirects for 1 minute.
        return res
          .set({
            "Cache-Control": "public, max-age=60",
            "Cache-Tag": "redirect,module-redirect"
          })
          .redirect(
            302,
            createPackageURL(
              req.packageName,
              req.packageVersion,
              filename,
              createSearch(req.query)
            )
          );
      }

      req.filename = filename;
      req.stats = stats;

      next();
    }
  );
}

module.exports = findFile;
