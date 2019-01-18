const url = require('url');

const packageURLFormat = /^\/((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(\/.*)?$/;

function decodeParam(param) {
  if (param) {
    try {
      return decodeURIComponent(param);
    } catch (error) {
      // Ignore invalid params.
    }
  }

  return '';
}

function parsePackageURL(originalURL) {
  const { pathname, search, query } = url.parse(originalURL, true);
  const match = packageURLFormat.exec(pathname);

  // Disallow invalid URL formats.
  if (match == null) {
    return null;
  }

  const packageName = match[1];
  const packageVersion = decodeParam(match[2]) || 'latest';
  const filename = decodeParam(match[3]);

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

module.exports = parsePackageURL;
