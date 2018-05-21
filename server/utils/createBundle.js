/**
 * Creates a bundle object that is stored on req.bundle.
 */
function createBundle(webpackStats) {
  const { publicPath, assetsByChunkName } = webpackStats;

  /**
   * Returns a public URL to the given asset.
   */
  function createURL(asset) {
    return publicPath + asset;
  }

  /**
   * Returns an array of URLs to all assets in the given chunks.
   */
  function getAssets(chunks = ["main"]) {
    return (Array.isArray(chunks) ? chunks : [chunks])
      .reduce((memo, chunk) => memo.concat(assetsByChunkName[chunk] || []), [])
      .map(createURL);
  }

  /**
   * Returns an array of URLs to all JavaScript files in the given chunks.
   */
  function getScripts(...chunks) {
    return getAssets(...chunks).filter(asset => /\.js$/.test(asset));
  }

  /**
   * Returns an array of URLs to all CSS files in the given chunks.
   */
  function getStyles(...chunks) {
    return getAssets(...chunks).filter(asset => /\.css$/.test(asset));
  }

  return {
    createURL,
    getAssets,
    getScripts,
    getStyles
  };
}

module.exports = createBundle;
