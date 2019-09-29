import { renderToStaticNodeStream } from 'react-dom/server';
import semver from 'semver';

import BrowseApp from '../client/browse/App.js';
import MainTemplate from '../templates/MainTemplate.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createElement } from '../utils/markup.js';
import { getVersionsAndTags } from '../utils/npm.js';

const doctype = '<!DOCTYPE html>';

function byVersion(a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}

async function getAvailableVersions(packageName, log) {
  const versionsAndTags = await getVersionsAndTags(packageName, log);
  return versionsAndTags ? versionsAndTags.versions.sort(byVersion) : [];
}

async function serveBrowsePage(req, res) {
  const availableVersions = await getAvailableVersions(
    req.packageName,
    req.log
  );
  const data = {
    packageName: req.packageName,
    packageVersion: req.packageVersion,
    availableVersions: availableVersions,
    filename: req.filename,
    target: req.browseTarget
  };
  const content = createElement(BrowseApp, data);

  const stream = renderToStaticNodeStream(
    createElement(MainTemplate, {
      title: `UNPKG - ${req.packageName}`,
      description: `The CDN for ${req.packageName}`,
      data,
      content
    })
  );

  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=14400', // 4 hours
    'Cache-Tag': 'browse'
  });

  res.write(doctype);

  stream.pipe(res);
}

export default asyncHandler(serveBrowsePage);
