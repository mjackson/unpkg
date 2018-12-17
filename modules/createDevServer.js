const express = require('express');
const morgan = require('morgan');
const WebpackDevServer = require('webpack-dev-server');
const devErrorHandler = require('errorhandler');

const devAssets = require('./middleware/devAssets');
const createDevCompiler = require('./createDevCompiler');
const createRouter = require('./createRouter');

function createDevServer(publicDir, webpackConfig, devOrigin) {
  const compiler = createDevCompiler(
    webpackConfig,
    `webpack-dev-server/client?${devOrigin}`
  );

  const server = new WebpackDevServer(compiler, {
    // webpack-dev-middleware options
    publicPath: webpackConfig.output.publicPath,
    quiet: false,
    noInfo: false,
    stats: {
      // https://webpack.js.org/configuration/stats/
      assets: true,
      colors: true,
      version: true,
      hash: true,
      timings: true,
      chunks: false
    },

    // webpack-dev-server options
    contentBase: false,
    disableHostCheck: true,
    before(app) {
      // This runs before webpack-dev-middleware
      app.disable('x-powered-by');
      app.use(morgan('dev'));
    }
  });

  // This runs after webpack-dev-middleware
  server.use(devErrorHandler());

  if (publicDir) {
    server.use(express.static(publicDir));
  }

  server.use(devAssets(compiler));
  server.use(createRouter());

  return server;
}

module.exports = createDevServer;
