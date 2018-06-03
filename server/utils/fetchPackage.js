const fetch = require("isomorphic-fetch");
const gunzip = require("gunzip-maybe");
const tar = require("tar-fs");

function stripNamePrefix(header) {
  // Most packages have header names that look like "package/index.js"
  // so we shorten that to just "index.js" here. A few packages use a
  // prefix other than "package/". e.g. the firebase package uses the
  // "firebase_npm/" prefix. So we just strip the first dir name.
  header.name = header.name.replace(/^[^/]+\//, "");
  return header;
}

function ignoreLinks(file, header) {
  return (
    header.type === "link" ||
    header.type === "symlink" ||
    (header.type === "directory" && !header.name.includes("/")) // Empty directory, see #99
  );
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

function fetchPackage(tarballURL, outputDir) {
  console.log(`info: Fetching ${tarballURL} and extracting to ${outputDir}`);
  return fetch(tarballURL).then(res => extractResponse(res, outputDir));
}

module.exports = fetchPackage;
