import { renderToStaticNodeStream } from 'react-dom/server';
import { subDays, startOfDay } from 'date-fns';

import MainApp from '../client/main/App.js';
import MainTemplate from '../templates/MainTemplate.js';
import getStats from '../utils/getStats.js';
import { createElement } from '../utils/markup.js';

const doctype = '<!DOCTYPE html>';

export default async function serveMainPage(req, res) {
  const until = startOfDay(new Date());
  const since = subDays(until, 30);

  let stats;

  try {
    stats = await getStats(since, until);
  } catch (err) {
    // Ignore error
  }

  const content = createElement(MainApp, { stats });

  const stream = renderToStaticNodeStream(
    createElement(MainTemplate, { content })
  );

  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=3600', // 1 hour
    'Cache-Tag': 'main'
  });

  res.write(doctype);

  stream.pipe(res);
}
