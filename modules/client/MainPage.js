import React from 'react';
import PropTypes from 'prop-types';

import createHTML from './utils/createHTML';
import x from './utils/execScript';

export default function MainPage({
  title,
  description,
  favicon,
  scripts,
  styles,
  data,
  content
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        {description && <meta name="description" content={description} />}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1"
        />
        <meta name="timestamp" content={new Date().toISOString()} />
        {favicon && <link rel="shortcut icon" href={favicon} />}
        {styles.map(s => (
          <link key={s} rel="stylesheet" href={s} />
        ))}
        {x(
          'window.Promise || document.write(\'\\x3Cscript src="/_polyfills/es6-promise.min.js">\\x3C/script>\\x3Cscript>ES6Promise.polyfill()\\x3C/script>\')'
        )}
        {x(
          'window.fetch || document.write(\'\\x3Cscript src="/_polyfills/fetch.min.js">\\x3C/script>\')'
        )}
        {x(`window.__DATA__ = ${JSON.stringify(data)}`)}
        <title>{title}</title>
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={content} />
        {scripts.map(s => (
          <script key={s} src={s} />
        ))}
      </body>
    </html>
  );
}

MainPage.defaultProps = {
  title: 'UNPKG',
  description: 'The CDN for everything on npm',
  favicon: '/favicon.ico',
  scripts: [],
  styles: [],
  data: {},
  content: createHTML('')
};

const htmlType = PropTypes.shape({
  __html: PropTypes.string
});

MainPage.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  favicon: PropTypes.string,
  scripts: PropTypes.arrayOf(PropTypes.string),
  styles: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.any,
  content: htmlType
};
