import { renderToStaticNodeStream } from 'react-dom/server';

import MainApp from '../client/main/App.js';
import MainTemplate from '../templates/MainTemplate.js';
import { createElement } from '../utils/markup.js';

const doctype = '<!DOCTYPE html>';

export default function serveMainPage(req, res) {
  const content = createElement(MainApp);

  const stream = renderToStaticNodeStream(
    createElement(MainTemplate, { content })
  );

  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=14400', // 4 hours
    'Cache-Tag': 'main'
  });

  res.write(doctype);

  stream.pipe(res);
}
