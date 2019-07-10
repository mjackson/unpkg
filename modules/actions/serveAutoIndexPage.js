import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import semver from 'semver';

import AutoIndexApp from '../client/autoIndex/App.js';

import MainTemplate from './utils/MainTemplate.js';
import createElement from './utils/createElement.js';
import createHTML from './utils/createHTML.js';
import createScript from './utils/createScript.js';
import getEntryPoint from './utils/getEntryPoint.js';
import getGlobalScripts from './utils/getGlobalScripts.js';

const doctype = '<!DOCTYPE html>';
const globalURLs =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
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
  const content = createHTML(renderToString(createElement(AutoIndexApp, data)));
  const entryPoint = getEntryPoint('autoIndex', 'iife');
  const elements = getGlobalScripts(entryPoint, globalURLs).concat(
    createScript(entryPoint.code)
  );

  const html =
    doctype +
    renderToStaticMarkup(
      createElement(MainTemplate, {
        title: `UNPKG - ${req.packageName}`,
        description: `The CDN for ${req.packageName}`,
        data,
        content,
        elements
      })
    );

  res
    .set({
      'Cache-Control': 'public, max-age=14400', // 4 hours
      'Cache-Tag': 'auto-index'
    })
    .send(html);
}
