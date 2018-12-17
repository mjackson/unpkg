const webpack = require('webpack');

/**
 * Returns a modified copy of the given webpackEntry object with
 * the moduleId in front of all other assets.
 */
function prependModuleId(webpackEntry, moduleId) {
  if (typeof webpackEntry === 'string') {
    return [moduleId, webpackEntry];
  }

  if (Array.isArray(webpackEntry)) {
    return [moduleId, ...webpackEntry];
  }

  if (webpackEntry && typeof webpackEntry === 'object') {
    const entry = { ...webpackEntry };

    for (const chunkName in entry) {
      if (entry.hasOwnProperty(chunkName)) {
        entry[chunkName] = prependModuleId(entry[chunkName], moduleId);
      }
    }

    return entry;
  }

  throw new Error('Invalid webpack entry object');
}

/**
 * Creates a webpack compiler that automatically inlines the
 * webpack dev runtime in all entry points.
 */
function createDevCompiler(webpackConfig, webpackRuntimeModuleId) {
  return webpack({
    ...webpackConfig,
    entry: prependModuleId(webpackConfig.entry, webpackRuntimeModuleId)
  });
}

module.exports = createDevCompiler;
