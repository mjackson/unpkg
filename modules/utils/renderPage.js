const React = require('react');
const ReactDOMServer = require('react-dom/server');

const doctype = '<!DOCTYPE html>';

function renderPage(page, props) {
  const element = React.createElement(page, props);
  return doctype + ReactDOMServer.renderToStaticMarkup(element);
}

module.exports = renderPage;
