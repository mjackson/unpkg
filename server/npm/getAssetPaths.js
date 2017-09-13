const assetPathsIndex = require('./assetPathsIndex')

function getAssetPaths(packageName, version) {
  const entries = assetPathsIndex[packageName]

  if (entries) {
    const matchingEntry = entries.find(function (entry) {
      const range = entry[0]

      if (range == null || semver.satisfies(version, range))
        return entry
    })

    return matchingEntry.slice(1)
  }

  return null
}

module.exports = getAssetPaths
