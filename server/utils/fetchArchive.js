const fetch = require("isomorphic-fetch");
const gunzip = require("gunzip-maybe");
const tar = require("tar-stream");

function fetchArchive(packageConfig) {
  const tarballURL = packageConfig.dist.tarball;

  return fetch(tarballURL).then(res =>
    res.body.pipe(gunzip()).pipe(tar.extract())
  );
}

module.exports = fetchArchive;
