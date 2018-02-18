const fs = require("fs");
const path = require("path");
const csso = require("csso");

function readCSS(...args) {
  return csso.minify(fs.readFileSync(path.resolve(...args), "utf8")).css;
}

module.exports = readCSS;
