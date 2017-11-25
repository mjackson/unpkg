const URL = require("whatwg-url")

function isRemoteModuleIdentifier(id) {
  // Fully-qualified URL or URL w/out protocol
  return (
    URL.parseURL(id) !== null || (id.substr(0, 2) === "//" && URL.parseURL(`http:${id}`) !== null)
  )
}

module.exports = isRemoteModuleIdentifier
