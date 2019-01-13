import React from 'react';
import ReactDOMServer from 'react-dom/server';

const doctype = '<!DOCTYPE html>';

export default function renderTemplate(component, props) {
  return (
    doctype +
    ReactDOMServer.renderToStaticMarkup(React.createElement(component, props))
  );
}
