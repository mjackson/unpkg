const path = require('path');
const builtinModules = require('module').builtinModules;
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const sizeSnapshot = require('rollup-plugin-size-snapshot').sizeSnapshot;
const url = require('rollup-plugin-url');

const env = process.env.NODE_ENV || 'development';
const dev = env === 'development';

// Allow storing env vars in .env in dev.
if (dev) require('dotenv').config();

const secretKey = require('./secretKey');

const functionsIndex = {
  external: id => true,
  input: path.resolve(__dirname, 'modules/functions/index.js'),
  output: {
    file: 'functions/index.js',
    format: 'cjs'
  },
  plugins: [
    babel(),
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
};

const fnsPkg = require('./functions/package.json');

const fnsDeps = (dev
  ? Object.keys(fnsPkg.dependencies).concat(Object.keys(fnsPkg.devDependencies))
  : Object.keys(fnsPkg.dependencies)
).concat('react-dom/server');

const functions = [
  // 'serveAuth',
  'serveAutoIndexPage',
  'serveNpmPackageFile',
  'servePublicKey',
  'serveStats'
].map(functionName => {
  return {
    external: builtinModules.concat(fnsDeps),
    input: path.resolve(__dirname, `modules/functions/${functionName}.js`),
    output: {
      file: `functions/${functionName}.js`,
      format: 'cjs'
    },
    plugins: [
      babel(),
      json(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
        'process.env.CLOUDFLARE_EMAIL': JSON.stringify(
          process.env.CLOUDFLARE_EMAIL
        ),
        'process.env.CLOUDFLARE_KEY': JSON.stringify(
          process.env.CLOUDFLARE_KEY
        ),
        'process.env.SECRET_KEY': JSON.stringify(secretKey)
      })
    ]
  };
});

const clients = ['main', 'autoIndex'].map(bundleName => {
  return {
    external: ['react', 'react-dom', 'react-router-dom', 'react-motion'],
    input: path.resolve(__dirname, `modules/client/${bundleName}.js`),
    output: {
      file: `public/_assets/${bundleName}.js`,
      format: 'iife',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-router-dom': 'ReactRouterDOM',
        'react-motion': 'ReactMotion'
      }
    },
    plugins: [
      babel({ exclude: /node_modules/ }),
      json(),
      resolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env)
      }),
      url({
        limit: 5 * 1024,
        publicPath: '/_assets/'
      }),
      sizeSnapshot()
    ]
  };
});

module.exports = [functionsIndex].concat(functions, clients);
