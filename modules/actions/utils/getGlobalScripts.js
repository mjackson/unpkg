import invariant from 'invariant';

import createElement from './createElement';

export default function getGlobalScripts(entryPoint, globalURLs) {
  return entryPoint.globalImports.map(id => {
    invariant(globalURLs[id], 'Missing global URL for id "%s"', id);
    return createElement('script', { src: globalURLs[id] });
  });
}
