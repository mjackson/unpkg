import serveHTMLModule from './serveHTMLModule.js';
import serveJavaScriptModule from './serveJavaScriptModule.js';

export default function serveModule(req, res) {
  const { contentType } = req.entry;
  if (
    contentType === 'application/javascript' ||
    contentType === 'text/x-typescript'
  ) {
    return serveJavaScriptModule(req, res);
  }

  if (contentType === 'text/html') {
    return serveHTMLModule(req, res);
  }

  res
    .status(403)
    .type('text')
    .send('module mode is available only for JavaScript and HTML files');
}
