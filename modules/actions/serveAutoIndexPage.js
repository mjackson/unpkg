const React = require('react');
const ReactDOMServer = require('react-dom/server');
const semver = require('semver');

const MainPage = require('../client/MainPage');
const AutoIndexApp = require('../client/autoIndex/App');
const createHTML = require('../client/utils/createHTML');
const renderPage = require('../utils/renderPage');

const globalScripts =
  process.env.NODE_ENV === 'production'
    ? [
        '/react@16.4.1/umd/react.production.min.js',
        '/react-dom@16.4.1/umd/react-dom.production.min.js'
      ]
    : [
        '/react@16.4.1/umd/react.development.js',
        '/react-dom@16.4.1/umd/react-dom.development.js'
      ];

function byVersion(a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}

function serveAutoIndexPage(req, res) {
  const scripts = globalScripts.concat(req.assets.getScripts('autoIndex'));
  const styles = req.assets.getStyles('autoIndex');

  const props = {
    packageName: req.packageName,
    packageVersion: req.packageVersion,
    availableVersions: Object.keys(req.packageInfo.versions).sort(byVersion),
    filename: req.filename,
    entry: req.entry,
    entries: req.entries
  };
  const content = createHTML(
    ReactDOMServer.renderToString(React.createElement(AutoIndexApp, props))
  );

  const html = renderPage(MainPage, {
    title: `UNPKG - ${req.packageName}`,
    description: `The CDN for ${req.packageName}`,
    scripts: scripts,
    styles: styles,
    data: props,
    content: content
  });

  res
    .set({
      'Cache-Control': 'public, max-age=600', // 10 minutes
      'Cache-Tag': 'auto-index'
    })
    .send(html);
}

module.exports = serveAutoIndexPage;
