require("isomorphic-fetch");

const config = require("../config");

function fetchPackageInfo(packageName) {
  let encodedPackageName;
  if (packageName.charAt(0) === "@") {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`;
  } else {
    encodedPackageName = encodeURIComponent(packageName);
  }

  const url = `${config.registryURL}/${encodedPackageName}`;

  console.log(`info: Fetching package info from ${url}`);

  return fetch(url, {
    headers: {
      Accept: "application/json"
    }
  }).then(res => (res.status === 404 ? null : res.json()));
}

module.exports = fetchPackageInfo;
