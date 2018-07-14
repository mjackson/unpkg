const url = require("url");
const https = require("https");
const gunzip = require("gunzip-maybe");
const tar = require("tar-stream");

const agent = new https.Agent({
  keepAlive: true
});

function fetchArchive(packageConfig) {
  return new Promise((resolve, reject) => {
    const tarballURL = url.parse(packageConfig.dist.tarball);
    const options = {
      hostname: tarballURL.hostname,
      path: tarballURL.pathname,
      agent: agent
    };

    https
      .get(options, res => {
        if (res.statusCode === 200) {
          resolve(res.pipe(gunzip()).pipe(tar.extract()));
        } else {
          reject(res);
        }
      })
      .on("error", reject);
  });
}

module.exports = fetchArchive;
