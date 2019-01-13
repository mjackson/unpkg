import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import MainTemplate from '../client/MainTemplate';
import MainApp from '../client/main/App';
import createHTML from '../client/utils/createHTML';
import getEntryPoints from '../utils/getEntryPoints';
import renderTemplate from '../utils/renderTemplate';

export default function serveMainPage(req, res) {
  const element = React.createElement(
    StaticRouter,
    { location: req.url },
    React.createElement(MainApp)
  );
  const content = createHTML(ReactDOMServer.renderToString(element));

  const entryPoints = getEntryPoints('main', {
    es: 'module',
    system: 'nomodule'
  });

  const html = renderTemplate(MainTemplate, { content, entryPoints });

  res
    .set({
      'Cache-Control': 'public, max-age=14400', // 4 hours
      'Cache-Tag': 'main'
    })
    .send(html);
}
