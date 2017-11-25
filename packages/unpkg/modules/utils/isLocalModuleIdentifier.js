const isRemoteModuleIdentifier = require("./isRemoteModuleIdentifier")

function isLocalModuleIdentifier(id) {
  return [".", "/"].includes(id.charAt(0)) && !isRemoteModuleIdentifier(id)
}

module.exports = isLocalModuleIdentifier
