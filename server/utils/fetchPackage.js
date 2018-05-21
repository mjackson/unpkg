require("isomorphic-fetch");
const fs = require("fs");
const mkdirp = require("mkdirp");
const gunzip = require("gunzip-maybe");
const tar = require("tar-fs");

const createTempPath = require("./createTempPath");

function stripNamePrefix(headers) {
  // Most packages have header names that look like "package/index.js"
  // so we shorten that to just "index.js" here. A few packages use a
  // prefix other than "package/". e.g. the firebase package uses the
  // "firebase_npm/" prefix. So we just strip the first dir name.
  headers.name = headers.name.replace(/^[^/]+\//, "");
  return headers;
}

function ignoreLinks(file, headers) {
  return headers.type === "link" || headers.type === "symlink";
}

function extractResponse(response, outputDir) {
  return new Promise((resolve, reject) => {
    const extract = tar.extract(outputDir, {
      readable: true, // All dirs/files should be readable.
      map: stripNamePrefix,
      ignore: ignoreLinks
    });

    response.body
      .pipe(gunzip())
      .pipe(extract)
      .on("finish", resolve)
      .on("error", reject);
  });
}

function fetchPackage(packageConfig) {
  return new Promise((resolve, reject) => {
    const tarballURL = packageConfig.dist.tarball;
    const outputDir = createTempPath(packageConfig.name, packageConfig.version);

    console.log(`info: Fetching ${tarballURL} and extracting to ${outputDir}`);

    fs.access(outputDir, error => {
      if (error) {
        if (error.code === "ENOENT" || error.code === "ENOTDIR") {
          // ENOENT or ENOTDIR are to be expected when we haven't yet
          // fetched a package for the first time. Carry on!
          mkdirp(outputDir, error => {
            if (error) {
              reject(error);
            } else {
              resolve(
                fetch(tarballURL)
                  .then(res => extractResponse(res, outputDir))
                  .then(() => outputDir)
              );
            }
          });
        } else {
          reject(error);
        }
      } else {
        // Best case: we already have this package cached on disk!
        resolve(outputDir);
      }
    });
  });
}

module.exports = fetchPackage;
