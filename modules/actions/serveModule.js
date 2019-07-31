import serveHTMLModule from './serveHTMLModule.js';
import serveJavaScriptModule from './serveJavaScriptModule.js';

export default function serveModule(req, res) {
  if (req.entry.contentType === 'application/javascript') {
    return serveJavaScriptModule(req, res);
  }

  if (req.entry.contentType === 'text/html') {
    return serveHTMLModule(req, res);
  }

  res
    .status(403)
    .type('text')
    .send('module mode is available only for JavaScript and HTML files');
}
