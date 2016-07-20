const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackMD5Hash = require('webpack-md5-hash')

module.exports = {
  entry: {
    vendor: [ 'react', 'react-dom' ],
    home: path.resolve(__dirname, 'modules/client/home.js')
  },

  output: {
    filename: '[chunkhash:8]-[name].js',
    path: path.resolve(__dirname, 'public/__assets__'),
    publicPath: '/__assets__/'
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css!postcss') },
      { test: /\.json$/, loader: 'json' },
      { test: /\.png$/, loader: 'file' },
      { test: /\.md$/, loader: 'html!markdown' }
    ]
  },

  plugins: [
    new WebpackMD5Hash(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new ChunkManifestPlugin({
      filename: 'chunk-manifest.json',
      manifestVariable: 'webpackManifest'
    }),
    new ExtractTextPlugin('[chunkhash:8]-styles.css'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.optimize.OccurrenceOrderPlugin()
  ],

  postcss: () => [ autoprefixer ]
}
