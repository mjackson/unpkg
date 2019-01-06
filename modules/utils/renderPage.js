import React from 'react';
import ReactDOMServer from 'react-dom/server';

const doctype = '<!DOCTYPE html>';

export default function renderPage(page, props) {
  return (
    doctype +
    ReactDOMServer.renderToStaticMarkup(React.createElement(page, props))
  );
}
