const bareModuleIdentifierFormat = /^((?:@[^\/]+\/)?[^\/]+)(\/.*)?$/

function parseBareModuleIdentifier(id) {
  const match = bareModuleIdentifierFormat.exec(id)

  return {
    packageName: match[1],
    file: match[2] || ""
  }
}

module.exports = parseBareModuleIdentifier
