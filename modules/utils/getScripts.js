import invariant from 'invariant';

import getEntryPoint from './getEntryPoint';

export default function getScripts(entryName, globalURLs) {
  const entryPoint = getEntryPoint(entryName, 'iife');

  invariant(entryPoint, 'Invalid entry name "%s"', entryName);

  const globalScripts = entryPoint.globalImports.map(id => {
    invariant(globalURLs[id], 'Missing global URL for id "%s"', id);
    return globalURLs[id];
  });

  return globalScripts.concat(entryPoint.url);
}
