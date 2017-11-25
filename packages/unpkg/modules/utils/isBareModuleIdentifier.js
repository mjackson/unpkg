const isLocalModuleIdentifier = require("./isLocalModuleIdentifier")
const isRemoteModuleIdentifier = require("./isRemoteModuleIdentifier")

function isBareModuleIdentifier(id) {
  return !(isLocalModuleIdentifier(id) || isRemoteModuleIdentifier(id))
}

module.exports = isBareModuleIdentifier
