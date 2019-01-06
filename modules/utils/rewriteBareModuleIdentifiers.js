import babel from '@babel/core';

import unpkgRewrite from '../plugins/unpkgRewrite';

export default function rewriteBareModuleIdentifiers(code, packageConfig) {
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
