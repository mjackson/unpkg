import React from 'react';
import { renderToString } from 'react-dom/server';

import MainTemplate from '../client/MainTemplate';
import MainApp from '../client/main/App';
import createHTML from '../client/utils/createHTML';
import getEntryPoints from '../utils/getEntryPoints';
import renderTemplate from '../utils/renderTemplate';

export default function serveMainPage(req, res) {
  const content = createHTML(renderToString(React.createElement(MainApp)));

  const entryPoints = getEntryPoints('main', {
    es: 'module',
    system: 'nomodule'
  });

  const html = renderTemplate(MainTemplate, { content, entryPoints });

  res
    .set({
      'Cache-Control': 'no-cache, no-store, must-revalidate', // do not cache
      'Cache-Tag': 'main'
    })
    .send(html);
}
