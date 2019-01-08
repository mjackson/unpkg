const semver = require('semver');

const addLeadingSlash = require('../utils/addLeadingSlash');
const createPackageURL = require('../utils/createPackageURL');
const createSearch = require('../utils/createSearch');
const getNpmPackageInfo = require('../utils/getNpmPackageInfo');
const incrementCounter = require('../utils/incrementCounter');

function tagRedirect(req, res) {
  const version = req.packageInfo['dist-tags'][req.packageVersion];

  res
    .set({
      'Cache-Control': 'public, max-age=600', // 10 minutes
      'Cache-Tag': 'redirect, tag-redirect'
    })
    .redirect(
      302,
      createPackageURL(req.packageName, version, req.filename, req.search)
    );
}

function semverRedirect(req, res) {
  const maxVersion = semver.maxSatisfying(
    Object.keys(req.packageInfo.versions),
    req.packageVersion
  );

  if (maxVersion) {
    res
      .set({
        'Cache-Control': 'public, max-age=600', // 10 minutes
        'Cache-Tag': 'redirect, semver-redirect'
      })
      .redirect(
        302,
        createPackageURL(req.packageName, maxVersion, req.filename, req.search)
      );
  } else {
    res
      .status(404)
      .type('text')
      .send(`Cannot find package ${req.packageSpec}`);
  }
}

function filenameRedirect(req, res) {
  let filename;
  if (req.query.module != null) {
    // See https://github.com/rollup/rollup/wiki/pkg.module
    filename =
      req.packageConfig.module ||
      req.packageConfig['jsnext:main'] ||
      '/index.js';
  } else if (
    req.query.main &&
    req.packageConfig[req.query.main] &&
    typeof req.packageConfig[req.query.main] === 'string'
  ) {
    // Deprecated, see #63
    filename = req.packageConfig[req.query.main];

    // Count which packages are using this so we can warn them when we
    // remove this functionality.
    incrementCounter(
      'package-json-custom-main',
      req.packageSpec + '?main=' + req.query.main,
      1
    );
  } else if (
    req.packageConfig.unpkg &&
    typeof req.packageConfig.unpkg === 'string'
  ) {
    filename = req.packageConfig.unpkg;
  } else if (
    req.packageConfig.browser &&
    typeof req.packageConfig.browser === 'string'
  ) {
    // Deprecated, see #63
    filename = req.packageConfig.browser;

    // Count which packages are using this so we can warn them when we
    // remove this functionality.
    incrementCounter('package-json-browser-fallback', req.packageSpec, 1);
  } else {
    filename = req.packageConfig.main || '/index.js';
  }

  // Redirect to the exact filename so relative imports
  // and URLs resolve correctly.
  res
    .set({
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'Cache-Tag': 'redirect, filename-redirect'
    })
    .redirect(
      302,
      createPackageURL(
        req.packageName,
        req.packageVersion,
        addLeadingSlash(filename),
        createSearch(req.query)
      )
    );
}

/**
 * Fetch the package metadata and tarball from npm. Redirect to the exact
 * version if the request targets a tag or uses a semver version, or to the
 * exact filename if the request omits the filename.
 */
function fetchPackage(req, res, next) {
  getNpmPackageInfo(req.packageName).then(
    packageInfo => {
      if (packageInfo == null || packageInfo.versions == null) {
        return res
          .status(404)
          .type('text')
          .send(`Cannot find package "${req.packageName}"`);
      }

      req.packageInfo = packageInfo;
      req.packageConfig = req.packageInfo.versions[req.packageVersion];

      if (!req.packageConfig) {
        // Redirect to a fully-resolved version.
        if (req.packageVersion in req.packageInfo['dist-tags']) {
          return tagRedirect(req, res);
        } else {
          return semverRedirect(req, res);
        }
      }

      if (!req.filename) {
        return filenameRedirect(req, res);
      }

      next();
    },
    error => {
      console.error(error);

      return res
        .status(500)
        .type('text')
        .send(`Cannot get info for package "${req.packageName}"`);
    }
  );
}

module.exports = fetchPackage;
