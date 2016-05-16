import fs from 'fs'
import invariant from 'invariant'
import webpack from 'webpack'

const createAssets = (webpackStats) => {
  const createURL = (asset) =>
    webpackStats.publicPath + asset

  const getAssets = (chunkName = 'main') => {
    const assets = webpackStats.assetsByChunkName[chunkName] || []
    return Array.isArray(assets) ? assets : [ assets ]
  }

  const getScriptURLs = (chunkName = 'main') =>
    getAssets(chunkName)
      .filter(asset => (/\.js$/).test(asset))
      .map(createURL)

  const getStyleURLs = (chunkName = 'main') =>
    getAssets(chunkName)
      .filter(asset => (/\.css$/).test(asset))
      .map(createURL)

  return {
    createURL,
    getAssets,
    getScriptURLs,
    getStyleURLs
  }
}

/**
 * An express middleware that sets req.assets from the build
 * info in the given stats file. Should be used in production.
 */
export const staticAssets = (webpackStatsFile) => {
  let stats
  try {
    stats = JSON.parse(fs.readFileSync(webpackStatsFile, 'utf8'))
  } catch (error) {
    invariant(
      false,
      'staticAssets middleware cannot read the build stats in %s; ' +
      'do `npm run build` before starting the server',
      webpackStatsFile
    )
  }

  const assets = createAssets(stats)

  return (req, res, next) => {
    req.assets = assets
    next()
  }
}

/**
 * An express middleware that sets req.assets from the
 * latest result from a running webpack compiler (i.e. using
 * webpack-dev-middleware). Should only be used in dev.
 */
export const assetsCompiler = (webpackCompiler) => {
  let assets
  webpackCompiler.plugin('done', (stats) => {
    assets = createAssets(stats.toJson())
  })

  return (req, res, next) => {
    invariant(
      assets != null,
      'assetsCompiler middleware needs a running compiler; ' +
      'use webpack-dev-middleware in front of assetsCompiler'
    )

    req.assets = assets
    next()
  }
}

/**
 * Creates a webpack compiler that automatically inlines the
 * webpack dev runtime in all entry points.
 */
export const createDevCompiler = (webpackConfig, webpackRuntimeModuleID) =>
  webpack({
    ...webpackConfig,
    entry: prependModuleID(
      webpackConfig.entry,
      webpackRuntimeModuleID
    )
  })

/**
 * Returns a modified copy of the given webpackEntry object with
 * the moduleID in front of all other assets.
 */
const prependModuleID = (webpackEntry, moduleID) => {
  if (typeof webpackEntry === 'string')
    return [ moduleID, webpackEntry ]

  if (Array.isArray(webpackEntry))
    return [ moduleID, ...webpackEntry ]

  if (webpackEntry && typeof webpackEntry === 'object') {
    const entry = { ...webpackEntry }

    for (const chunkName in entry)
      if (entry.hasOwnProperty(chunkName))
        entry[chunkName] = prependModuleID(entry[chunkName], moduleID)

    return entry
  }

  throw new Error('Invalid webpack entry object')
}
