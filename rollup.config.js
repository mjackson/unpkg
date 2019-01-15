const path = require('path');
const builtinModules = require('module').builtinModules;
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const url = require('rollup-plugin-url');

const entryManifest = require('./plugins/entryManifest');

const env = process.env.NODE_ENV || 'development';
const dev = env === 'development';

// Allow storing env vars in .env in dev.
if (dev) require('dotenv').config();

const manifest = entryManifest();

const client = {
  input: ['modules/client/main.js', 'modules/client/autoIndex.js'],
  output: [
    {
      // ESM version for modern browsers
      format: 'esm',
      dir: 'public/_client',
      entryFileNames: '[name]-[hash].js',
      chunkFileNames: '[name]-[hash].js'
    },
    {
      // SystemJS version for older browsers
      format: 'system',
      dir: 'public/_client',
      entryFileNames: '[name]-[hash].system.js',
      chunkFileNames: '[name]-[hash].system.js'
    }
  ],
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
    })
  ]
};

const secretKey = require('./secretKey');
const fnsPkg = require('./functions/package.json');

const fnsDeps = (dev
  ? Object.keys(fnsPkg.dependencies).concat(
      Object.keys(fnsPkg.devDependencies || {})
    )
  : Object.keys(fnsPkg.dependencies)
).concat('react-dom/server');

const functions = [
  {
    external: id => true,
    input: path.resolve(__dirname, 'modules/functions/index.js'),
    output: { file: 'functions/index.js', format: 'cjs' },
    plugins: [
      babel(),
      json(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env)
      })
    ]
  }
].concat(
  [
    // 'serveAuth',
    'serveMainPage',
    'serveNpmPackageFile',
    'servePublicKey',
    'serveStats'
  ].map(functionName => {
    return {
      external: builtinModules.concat(fnsDeps),
      input: path.resolve(__dirname, `modules/functions/${functionName}.js`),
      output: { file: `functions/${functionName}.js`, format: 'cjs' },
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
          'process.env.NODE_ENV': JSON.stringify(env),
          'process.env.CLOUDFLARE_EMAIL': JSON.stringify(
            process.env.CLOUDFLARE_EMAIL
          ),
          'process.env.CLOUDFLARE_KEY': JSON.stringify(
            process.env.CLOUDFLARE_KEY
          ),
          'process.env.ORIGIN': JSON.stringify(process.env.ORIGIN),
          'process.env.SECRET_KEY': JSON.stringify(secretKey)
        })
      ]
    };
  })
);

module.exports = [client].concat(functions);
