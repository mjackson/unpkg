const React = require("react");
const ReactDOMServer = require("react-dom/server");

const doctype = "<!DOCTYPE html>";

function renderPage(page, props) {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(page, props)
  );

  return doctype + html;
}

module.exports = renderPage;
