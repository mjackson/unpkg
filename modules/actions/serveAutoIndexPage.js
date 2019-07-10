import { renderToString, renderToStaticMarkup } from 'react-dom/server';

import AutoIndexApp from '../client/autoIndex/App.js';

import MainTemplate from './utils/MainTemplate.js';
import getScripts from './utils/getScripts.js';
import { createElement, createHTML } from './utils/markupHelpers.js';
import { getAvailableVersions } from '../utils/npm.js';

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

export default async function serveAutoIndexPage(req, res) {
  const availableVersions = await getAvailableVersions(req.packageName);
  const data = {
    packageName: req.packageName,
    packageVersion: req.packageVersion,
    availableVersions: availableVersions,
    filename: req.filename,
    entry: req.entry,
    entries: req.entries
  };
  const content = createHTML(renderToString(createElement(AutoIndexApp, data)));
  const elements = getScripts('autoIndex', 'iife', globalURLs);

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
