// Virtual module id; see rollup.config.js
// eslint-disable-next-line import/no-unresolved
import entryManifest from 'entry-manifest';

import { createElement, createScript } from './markup.js';

function getEntryPoint(name, format) {
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

function getGlobalScripts(entryPoint, globalURLs) {
  return entryPoint.globalImports.map(id => {
    if (process.env.NODE_ENV !== 'production') {
      if (!globalURLs[id]) {
        throw new Error('Missing global URL for id "%s"', id);
      }
    }

    return createElement('script', { src: globalURLs[id] });
  });
}

export default function getScripts(entryName, format, globalURLs) {
  const entryPoint = getEntryPoint(entryName, format);

  if (!entryPoint) return [];

  return getGlobalScripts(entryPoint, globalURLs).concat(
    createScript(entryPoint.code)
  );
}
