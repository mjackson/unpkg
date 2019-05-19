require('dotenv').config();

const path = require('path');
const builtinModules = require('module').builtinModules;
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const url = require('rollup-plugin-url');

const entryManifest = require('./plugins/entryManifest');
const pkg = require('./package.json');
const secretKey = require('./secretKey');

const env = process.env.NODE_ENV || 'development';
const dev = env === 'development';

const manifest = entryManifest();

const client = ['main', 'autoIndex'].map(entryName => {
  return {
    external: ['react', 'react-dom', '@emotion/core'],
    input: `modules/client/${entryName}.js`,
    output: {
      format: 'iife',
      dir: 'public/_client',
      entryFileNames: '[name]-[hash].js',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@emotion/core': 'emotionCore'
      }
    },
    plugins: [
      manifest.record({ publicPath: '/_client/' }),
      babel({ exclude: /node_modules/ }),
      json(),
      resolve(),
      commonjs({
        namedExports: {
          'node_modules/react/index.js': [
            'createContext',
            'createElement',
            'forwardRef',
            'Component',
            'Fragment'
          ]
        }
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env)
      }),
      url({
        limit: 5 * 1024,
        publicPath: '/_client/'
      }),
      compiler(dev ? { formatting: 'PRETTY_PRINT' } : undefined)
    ]
  };
});

const dependencies = (dev
  ? Object.keys(pkg.dependencies).concat(Object.keys(pkg.devDependencies || {}))
  : Object.keys(pkg.dependencies)
).concat('react-dom/server');

const server = {
  external: builtinModules.concat(dependencies),
  input: path.resolve(__dirname, 'modules/server.js'),
  output: { file: 'server.js', format: 'cjs' },
  plugins: [
    manifest.inject({ virtualId: 'entry-manifest' }),
    babel({ exclude: /node_modules/ }),
    json(),
    resolve(),
    commonjs(),
    url({
      limit: 5 * 1024,
      publicPath: '/_client/',
      emitFiles: false
    }),
    replace({
      'process.env.CLOUDFLARE_EMAIL': JSON.stringify(
        process.env.CLOUDFLARE_EMAIL
      ),
      'process.env.CLOUDFLARE_KEY': JSON.stringify(process.env.CLOUDFLARE_KEY),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.NPM_REGISTRY_URL': JSON.stringify(
        process.env.NPM_REGISTRY_URL
      ),
      'process.env.ORIGIN': JSON.stringify(process.env.ORIGIN),
      'process.env.SECRET_KEY': JSON.stringify(secretKey)
    })
  ]
};

module.exports = client.concat(server);
