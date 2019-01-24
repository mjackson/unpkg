// Virtual module id; see rollup.config.js
import entryManifest from 'entry-manifest';

export default function getEntryPoint(name, format) {
  let entryPoints;
  entryManifest.forEach(manifest => {
    if (name in manifest) {
      entryPoints = manifest[name];
    }
  });

  if (entryPoints) {
    return entryPoints.find(e => e.format === format);
  }

  return null;
}
