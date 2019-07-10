import { createElement } from './markupHelpers.js';

export default function getGlobalScripts(entryPoint, globalURLs) {
  return entryPoint.globalImports.map(id => {
    if (process.env.NODE_ENV !== 'production') {
      if (!globalURLs[id]) {
        throw new Error('Missing global URL for id "%s"', id);
      }
    }

    return createElement('script', { src: globalURLs[id] });
  });
}
