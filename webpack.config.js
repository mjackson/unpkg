const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const AssetURLPrefix = '[hash:8]/'

module.exports = {
  entry: {
    home: path.resolve(__dirname, 'modules/client/home.js')
  },

  output: {
    filename: `${AssetURLPrefix}[name].js`,
    path: path.resolve(__dirname, 'public/__assets__'),
    publicPath: '/__assets__/'
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css!postcss') }
    ]
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin(`${AssetURLPrefix}styles.css`),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],

  postcss: () => [ autoprefixer ]
}
