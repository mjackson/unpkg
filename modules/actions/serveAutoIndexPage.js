import React from 'react';
import ReactDOMServer from 'react-dom/server';
import semver from 'semver';

import MainTemplate from '../client/MainTemplate';
import AutoIndexApp from '../client/autoIndex/App';
import createHTML from '../client/utils/createHTML';
import getScripts from '../utils/getScripts';
import renderTemplate from '../utils/renderTemplate';

const globalURLs =
  process.env.NODE_ENV === 'production'
    ? {
        '@emotion/core': '/@emotion/core@10.0.6/dist/core.umd.min.js',
        react: '/react@16.7.0/umd/react.production.min.js',
        'react-dom': '/react-dom@16.7.0/umd/react-dom.production.min.js'
      }
    : {
        '@emotion/core': '/@emotion/core@10.0.6/dist/core.umd.min.js',
        react: '/react@16.7.0/umd/react.development.js',
        'react-dom': '/react-dom@16.7.0/umd/react-dom.development.js'
      };

function byVersion(a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}

export default function serveAutoIndexPage(req, res) {
  const data = {
    packageName: req.packageName,
    packageVersion: req.packageVersion,
    availableVersions: Object.keys(req.packageInfo.versions).sort(byVersion),
    filename: req.filename,
    entry: req.entry,
    entries: req.entries
  };

  const content = createHTML(
    ReactDOMServer.renderToString(React.createElement(AutoIndexApp, data))
  );

  const scripts = getScripts('autoIndex', globalURLs);

  const html = renderTemplate(MainTemplate, {
    title: `UNPKG - ${req.packageName}`,
    description: `The CDN for ${req.packageName}`,
    data,
    content,
    scripts
  });

  res
    .set({
      'Cache-Control': 'no-cache, no-store, must-revalidate', // do not cache
      'Cache-Tag': 'auto-index'
    })
    .send(html);
}
