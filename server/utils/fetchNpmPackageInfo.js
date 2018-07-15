const url = require("url");
const https = require("https");

const config = require("../config");
const bufferStream = require("./bufferStream");
const agent = require("./registryAgent");

function parseJSON(res) {
  return bufferStream(res).then(JSON.parse);
}

function fetchNpmPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    const encodedPackageName =
      packageName.charAt(0) === "@"
        ? `@${encodeURIComponent(packageName.substring(1))}`
        : encodeURIComponent(packageName);

    const infoURL = `${config.registryURL}/${encodedPackageName}`;

    console.log(
      `info: Fetching package info for ${packageName} from ${infoURL}`
    );

    const { hostname, pathname } = url.parse(infoURL);
    const options = {
      agent: agent,
      hostname: hostname,
      path: pathname,
      headers: {
        Accept: "application/json"
      }
    };

    https
      .get(options, res => {
        if (res.statusCode === 200) {
          resolve(parseJSON(res));
        } else {
          bufferStream(res).then(data => {
            const content = data.toString("utf-8");
            const error = new Error(
              `Failed to fetch info for ${packageName}\nstatus: ${
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

module.exports = fetchNpmPackageInfo;
