const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const outputPrefix = '[chunkhash:8]-'

module.exports = {
  entry: {
    vendor: [ 'react' ],
    home: path.resolve(__dirname, 'modules/client/home.js')
  },

  output: {
    filename: `${outputPrefix}[name].js`,
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
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' }),
    new ExtractTextPlugin(`${outputPrefix}styles.css`),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],

  postcss: () => [ autoprefixer ]
}
