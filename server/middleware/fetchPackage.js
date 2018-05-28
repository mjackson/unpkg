const semver = require("semver");

const createPackageURL = require("../utils/createPackageURL");
const getPackageInfo = require("../utils/getPackageInfo");
const getPackage = require("../utils/getPackage");

function tagRedirect(req, res) {
  // Cache tag redirects for 1 minute.
  res
    .set({
      "Cache-Control": "public, max-age=60",
      "Cache-Tag": "redirect,tag-redirect"
    })
    .redirect(
      302,
      createPackageURL(
        req.packageName,
        req.packageInfo["dist-tags"][req.packageVersion],
        req.filename,
        req.search
      )
    );
}

function semverRedirect(req, res) {
  const maxVersion = semver.maxSatisfying(
    Object.keys(req.packageInfo.versions),
    req.packageVersion
  );

  if (maxVersion) {
    // Cache semver redirects for 1 minute.
    res
      .set({
        "Cache-Control": "public, max-age=60",
        "Cache-Tag": "redirect,semver-redirect"
      })
      .redirect(
        302,
        createPackageURL(req.packageName, maxVersion, req.filename, req.search)
      );
  } else {
    res
      .status(404)
      .type("text")
      .send(`Cannot find package ${req.packageSpec}`);
  }
}

/**
 * Fetch the package metadata and tarball from npm. Redirect to the exact
 * version if the request targets a tag or uses a semver version.
 */
function fetchPackage(req, res, next) {
  getPackageInfo(req.packageName).then(
    packageInfo => {
      if (packageInfo == null || packageInfo.versions == null) {
        return res
          .status(404)
          .type("text")
          .send(`Cannot find package "${req.packageName}"`);
      }

      req.packageInfo = packageInfo;

      if (req.packageVersion in req.packageInfo.versions) {
        // A valid request for a package we haven't downloaded yet.
        req.packageConfig = req.packageInfo.versions[req.packageVersion];

        getPackage(req.packageConfig).then(
          outputDir => {
            req.packageDir = outputDir;
            next();
          },
          error => {
            console.error(error);

            res
              .status(500)
              .type("text")
              .send(`Cannot fetch package ${req.packageSpec}`);
          }
        );
      } else if (req.packageVersion in req.packageInfo["dist-tags"]) {
        tagRedirect(req, res);
      } else {
        semverRedirect(req, res);
      }
    },
    error => {
      console.error(error);

      return res
        .status(500)
        .type("text")
        .send(`Cannot get info for package "${req.packageName}"`);
    }
  );
}

module.exports = fetchPackage;
