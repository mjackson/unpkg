import React from 'react';
import ReactDOMServer from 'react-dom/server';
import semver from 'semver';

import MainTemplate from '../client/MainTemplate';
import AutoIndexApp from '../client/autoIndex/App';
import createHTML from '../client/utils/createHTML';
import getEntryPoints from '../utils/getEntryPoints';
import renderTemplate from '../utils/renderTemplate';

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

  const entryPoints = getEntryPoints('autoIndex', {
    es: 'module',
    system: 'nomodule'
  });

  const html = renderTemplate(MainTemplate, {
    title: `UNPKG - ${req.packageName}`,
    description: `The CDN for ${req.packageName}`,
    data,
    content,
    entryPoints
  });

  res
    .set({
      'Cache-Control': 'public, max-age=14400', // 4 hours
      'Cache-Tag': 'auto-index'
    })
    .send(html);
}
