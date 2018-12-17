/**
 * Creates an assets object that is stored on req.assets.
 */
function createAssets(webpackStats) {
  const { publicPath, assetsByChunkName } = webpackStats;

  /**
   * Returns a public URL to the given asset.
   */
  const createURL = asset => publicPath + asset;

  /**
   * Returns an array of URLs to all assets in the given chunks.
   */
  const getAll = (chunks = ['main']) =>
    (Array.isArray(chunks) ? chunks : [chunks])
      .reduce((memo, chunk) => memo.concat(assetsByChunkName[chunk] || []), [])
      .map(createURL);

  /**
   * Returns an array of URLs to all JavaScript files in the given chunks.
   */
  const getScripts = (...chunks) =>
    getAll(...chunks).filter(asset => /\.js$/.test(asset));

  /**
   * Returns an array of URLs to all CSS files in the given chunks.
   */
  const getStyles = (...chunks) =>
    getAll(...chunks).filter(asset => /\.css$/.test(asset));

  return {
    createURL,
    getAll,
    getScripts,
    getStyles
  };
}

module.exports = createAssets;
