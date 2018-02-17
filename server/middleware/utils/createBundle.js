/**
 * Creates a bundle object that is stored on req.bundle.
 */
function createBundle(webpackStats) {
  const { publicPath, assetsByChunkName } = webpackStats;

  const createURL = asset => publicPath + asset;

  const getAssets = (chunks = ["main"]) =>
    (Array.isArray(chunks) ? chunks : [chunks])
      .reduce((memo, chunk) => memo.concat(assetsByChunkName[chunk] || []), [])
      .map(createURL);

  const getScripts = (...args) =>
    getAssets(...args).filter(asset => /\.js$/.test(asset));

  const getStyles = (...args) =>
    getAssets(...args).filter(asset => /\.css$/.test(asset));

  return {
    createURL,
    getAssets,
    getScripts,
    getStyles
  };
}

module.exports = createBundle;
