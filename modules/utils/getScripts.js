// Virtual module id; see rollup.config.js
// eslint-disable-next-line import/no-unresolved
import entryManifest from 'entry-manifest';

import { createElement, createScript } from './markup.js';

function getEntryPoint(name, format) {
  for (let manifest of entryManifest) {
    let bundles = manifest[name];
    if (bundles) {
      return bundles.find(b => b.format === format);
    }
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
    // Inline the code for this entry point into the page
    // itself instead of using another <script> tag
    createScript(entryPoint.code)
  );
}
