const path = require("path");
const tmpdir = require("os-tmpdir");

function createTempPath(name, version) {
  const hyphenName = name.replace(/\//g, "-");
  return path.join(tmpdir(), `unpkg-${hyphenName}-${version}`);
}

module.exports = createTempPath;
