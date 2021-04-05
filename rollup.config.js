const builtinModules = require('module').builtinModules;
const execSync = require('child_process').execSync;

const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const url = require('rollup-plugin-url');

const entryManifest = require('./plugins/entryManifest');
const pkg = require('./package.json');

const buildId =
  process.env.BUILD_ID ||
  execSync('git rev-parse --short HEAD').toString().trim();

const manifest = entryManifest();

const client = ['browse', 'main'].map(entryName => {
  return {
    external: ['@emotion/core', 'react', 'react-dom'],
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
    moduleContext: {
      'node_modules/react-icons/lib/esm/iconBase.js': 'window'
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
        'process.env.BUILD_ID': JSON.stringify(buildId),
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        )
      }),
      url({
        limit: 5 * 1024,
        publicPath: '/_client/'
      }),
      compiler()
    ]
  };
});

const dependencies = (process.env.NODE_ENV === 'development'
  ? Object.keys(pkg.dependencies).concat(Object.keys(pkg.devDependencies || {}))
  : Object.keys(pkg.dependencies)
).concat('react-dom/server');

const server = {
  external: builtinModules.concat(dependencies),
  input: 'modules/server.js',
  output: { file: 'server.js', format: 'cjs' },
  moduleContext: {
    'node_modules/react-icons/lib/esm/iconBase.js': 'global'
  },
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
      'process.env.BUILD_ID': JSON.stringify(buildId)
    })
  ]
};

module.exports = client.concat(server);
