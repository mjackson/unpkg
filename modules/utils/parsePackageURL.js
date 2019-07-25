import url from 'url';

const packageURLFormat = /^\/((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(\/.*)?$/;

export default function parsePackageURL(originalURL) {
  let { pathname, search, query } = url.parse(originalURL, true);
  try {
    pathname = decodeURIComponent(pathname);
  } catch (error) {
    return null;
  }

  const match = packageURLFormat.exec(pathname);

  // Disallow invalid URL formats.
  if (match == null) {
    return null;
  }

  const packageName = match[1];
  const packageVersion = match[2] || 'latest';
  const filename = (match[3] || '').replace(/\/\/+/g, '/');

  return {
    // If the URL is /@scope/name@version/file.js?main=browser:
    pathname, // /@scope/name@version/path.js
    search: search || '', // ?main=browser
    query, // { main: 'browser' }
    packageName, // @scope/name
    packageVersion, // version
    filename // /file.js
  };
}
