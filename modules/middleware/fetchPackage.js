import semver from 'semver';

import addLeadingSlash from '../utils/addLeadingSlash';
import createPackageURL from '../utils/createPackageURL';
import createSearch from '../utils/createSearch';
import { getConfig, getTags, getVersions } from '../utils/npm';

function tagRedirect(req, res, version) {
  res
    .set({
      'Cache-Control': 'public, s-maxage=14400, max-age=3600', // 4 hours on CDN, 1 hour on clients
      'Cache-Tag': 'redirect, tag-redirect'
    })
    .redirect(
      302,
      createPackageURL(req.packageName, version, req.filename, req.search)
    );
}

function semverRedirect(req, res, version) {
  res
    .set({
      'Cache-Control': 'public, s-maxage=14400, max-age=3600', // 4 hours on CDN, 1 hour on clients
      'Cache-Tag': 'redirect, semver-redirect'
    })
    .redirect(
      302,
      createPackageURL(req.packageName, version, req.filename, req.search)
    );
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
export default function fetchPackage(req, res, next) {
  getConfig(req.packageName, req.packageVersion).then(
    config => {
      if (config) {
        req.packageConfig = config;
        return req.filename ? next() : filenameRedirect(req, res);
      }

      getTags(req.packageName).then(
        tags => {
          if (req.packageVersion in tags) {
            return tagRedirect(req, res, tags[req.packageVersion]);
          }

          getVersions(req.packageName).then(
            versions => {
              const maxVersion = semver.maxSatisfying(
                versions,
                req.packageVersion
              );

              if (maxVersion) {
                return semverRedirect(req, res, maxVersion);
              }

              res
                .status(404)
                .type('text')
                .send(
                  `Cannot find matching version for package "${
                    req.packageName
                  }" at version "${req.packageVersion}"`
                );
            },
            error => {
              console.error(error);

              res
                .status(500)
                .type('text')
                .send(`Cannot get versions for package "${req.packageName}"`);
            }
          );
        },
        error => {
          console.error(error);

          res
            .status(500)
            .type('text')
            .send(`Cannot get tags for package "${req.packageName}"`);
        }
      );
    },
    error => {
      console.error(error);

      res
        .status(500)
        .type('text')
        .send(`Cannot get config for package "${req.packageSpec}"`);
    }
  );
}
