const unpkg = require("unpkg")
const warning = require("warning")

function unpkgRewrite(dependencies = {}) {
  return {
    inherits: require("babel-plugin-syntax-export-extensions"),

    visitor: {
      "ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration"(path) {
        if (!path.node.source) return // probably a variable declaration

        const id = path.node.source.value

        if (unpkg.isRemoteModuleIdentifier(id)) {
          return // leave it alone
        } else if (unpkg.isLocalModuleIdentifier(id)) {
          path.node.source.value = `${id}?module`
        } else if (unpkg.isBareModuleIdentifier(id)) {
          const { packageName, file } = unpkg.parseBareModuleIdentifier(id)

          warning(
            dependencies[packageName],
            'Missing version info for package "%s" in dependencies; falling back to "latest"',
            packageName
          )

          const version = dependencies[packageName] || "latest"

          path.node.source.value = `https://unpkg.com/${packageName}@${version}${file}?module`
        }
      }
    }
  }
}

module.exports = unpkgRewrite
