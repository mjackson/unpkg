import { renderToString, renderToStaticMarkup } from 'react-dom/server';

import MainApp from '../client/main/App.js';
import MainTemplate from '../templates/MainTemplate.js';
import getScripts from '../utils/getScripts.js';
import { createElement, createHTML } from '../utils/markup.js';

const doctype = '<!DOCTYPE html>';
const globalURLs =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    ? {
        '@emotion/core': '/@emotion/core@10.0.6/dist/core.umd.min.js',
        react: '/react@16.8.6/umd/react.production.min.js',
        'react-dom': '/react-dom@16.8.6/umd/react-dom.production.min.js'
      }
    : {
        '@emotion/core': '/@emotion/core@10.0.6/dist/core.umd.min.js',
        react: '/react@16.8.6/umd/react.development.js',
        'react-dom': '/react-dom@16.8.6/umd/react-dom.development.js'
      };

export default function serveMainPage(req, res) {
  const content = createHTML(renderToString(createElement(MainApp)));
  const elements = getScripts('main', 'iife', globalURLs);

  const html =
    doctype +
    renderToStaticMarkup(createElement(MainTemplate, { content, elements }));

  res
    .set({
      'Cache-Control': 'public, max-age=14400', // 4 hours
      'Cache-Tag': 'main'
    })
    .send(html);
}
