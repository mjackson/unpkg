const URL = require("whatwg-url")

function isBareModuleIdentifier(id) {
  return !(
    URL.parseURL(id) !== null || // fully qualified URL
    id.substr(0, 2) === "//" || // URL w/out protocol
    [".", "/"].includes(id.charAt(0))
  ) // local path
}

module.exports = isBareModuleIdentifier
