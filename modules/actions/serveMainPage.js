import React from 'react';
import { renderToString } from 'react-dom/server';

import MainTemplate from '../client/MainTemplate';
import MainApp from '../client/main/App';
import createHTML from '../client/utils/createHTML';
import getScripts from '../utils/getScripts';
import renderTemplate from '../utils/renderTemplate';

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
  const content = createHTML(renderToString(React.createElement(MainApp)));
  const scripts = getScripts('main', globalURLs);
  const html = renderTemplate(MainTemplate, { content, scripts });

  res
    .set({
      'Cache-Control': 'no-cache, no-store, must-revalidate', // do not cache
      'Cache-Tag': 'main'
    })
    .send(html);
}
