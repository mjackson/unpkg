import React from 'react';
import ReactDOMServer from 'react-dom/server';
import semver from 'semver';

import MainPage from '../client/MainPage';
import AutoIndexApp from '../client/autoIndex/App';
import createHTML from '../client/utils/createHTML';
import renderPage from '../utils/renderPage';

const globalScripts =
  process.env.NODE_ENV === 'production'
    ? [
        '/react@16.7.0/umd/react.production.min.js',
        '/react-dom@16.7.0/umd/react-dom.production.min.js'
      ]
    : [
        '/react@16.7.0/umd/react.development.js',
        '/react-dom@16.7.0/umd/react-dom.development.js'
      ];

function byVersion(a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}

export default function serveAutoIndexPage(req, res) {
  const scripts = globalScripts.concat('/_assets/autoIndex.js');
  const styles = ['/autoIndex.css'];

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
