const babel = require('babel-core');

const unpkgRewrite = require('../plugins/unpkgRewrite');

function rewriteBareModuleIdentifiers(code, packageConfig) {
  const dependencies = Object.assign(
    {},
    packageConfig.peerDependencies,
    packageConfig.dependencies
  );

  const options = {
    // Ignore .babelrc and package.json babel config
    // because we haven't installed dependencies so
    // we can't load plugins; see #84
    babelrc: false,
    plugins: [unpkgRewrite(dependencies)]
  };

  return babel.transform(code, options).code;
}

module.exports = rewriteBareModuleIdentifiers;
