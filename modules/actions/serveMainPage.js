import { renderToString, renderToStaticMarkup } from 'react-dom/server';

import MainApp from '../client/main/App';

import createElement from './utils/createElement';
import createHTML from './utils/createHTML';
import createScript from './utils/createScript';
import getEntryPoint from './utils/getEntryPoint';
import getGlobalScripts from './utils/getGlobalScripts';
import MainTemplate from './utils/MainTemplate';

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

export default function serveMainPage(req, res) {
  const content = createHTML(renderToString(createElement(MainApp)));
  const entryPoint = getEntryPoint('main', 'iife');
  const elements = getGlobalScripts(entryPoint, globalURLs).concat(
    createScript(entryPoint.code)
  );

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
