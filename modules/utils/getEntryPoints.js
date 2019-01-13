import invariant from 'invariant';

// Virtual module id; see rollup.config.js
import entryManifest from 'entry-manifest';

export default function getEntryPoints(entryName, formatKeys) {
  const manifest = entryManifest[entryName];

  invariant(manifest, 'Invalid entry name: %s', entryName);

  return manifest.reduce((memo, entryPoint) => {
    if (entryPoint.format in formatKeys) {
      const key = formatKeys[entryPoint.format];
      memo[key] = entryPoint.url;
    }

    return memo;
  }, {});
}
