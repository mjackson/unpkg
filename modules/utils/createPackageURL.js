import createSearch from './createSearch.js';

export default function createPackageURL(
  packageName,
  packageVersion,
  filename,
  query
) {
  let url = `/${packageName}`;

  if (packageVersion) url += `@${packageVersion}`;
  if (filename) url += filename;
  if (query) url += createSearch(query);

  return url;
}
