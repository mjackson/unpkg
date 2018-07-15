const url = require("url");
const https = require("https");
const gunzip = require("gunzip-maybe");
const tar = require("tar-stream");

const agent = require("./registryAgent");

function fetchNpmPackage(packageConfig) {
  return new Promise((resolve, reject) => {
    const tarballURL = packageConfig.dist.tarball;

    console.log(
      `info: Fetching package for ${packageConfig.name} from ${tarballURL}`
    );

    const { hostname, pathname } = url.parse(tarballURL);
    const options = {
      agent: agent,
      hostname: hostname,
      path: pathname
    };

    https
      .get(options, res => {
        if (res.statusCode === 200) {
          resolve(res.pipe(gunzip()).pipe(tar.extract()));
        } else {
          const spec = `${packageConfig.name}@${packageConfig.version}`;
          reject(new Error(`Failed to fetch tarball for ${spec}`));
        }
      })
      .on("error", reject);
  });
}

module.exports = fetchNpmPackage;
