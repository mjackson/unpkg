const url = require("url");
const https = require(process.env.NPM_REGISTRY_URL.indexOf("http:") !== 0
  ? "https"
  : "http");
const gunzip = require("gunzip-maybe");
const tar = require("tar-stream");

const bufferStream = require("./bufferStream");
const agent = require("./registryAgent");
const logging = require("./logging");

function fetchNpmPackage(packageConfig) {
  return new Promise((resolve, reject) => {
    const tarballURL = packageConfig.dist.tarball;

    logging.debug(
      "Fetching package for %s from %s",
      packageConfig.name,
      tarballURL
    );

    const { hostname, pathname, protocol, port } = url.parse(tarballURL);
    const options = {
      protocol: protocol,
      port: port,
      agent: agent,
      hostname: hostname,
      path: pathname
    };

    https
      .get(options, res => {
        if (res.statusCode === 200) {
          resolve(res.pipe(gunzip()).pipe(tar.extract()));
        } else {
          bufferStream(res).then(data => {
            const spec = `${packageConfig.name}@${packageConfig.version}`;
            const content = data.toString("utf-8");
            const error = new Error(
              `Failed to fetch tarball for ${spec}\nstatus: ${
                res.statusCode
              }\ndata: ${content}`
            );

            reject(error);
          });
        }
      })
      .on("error", reject);
  });
}

module.exports = fetchNpmPackage;
