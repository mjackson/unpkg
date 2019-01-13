import React from 'react';
import PropTypes from 'prop-types';

import createHTML from './utils/createHTML';
import x from './utils/execScript';

const promiseShim =
  'window.Promise || document.write(\'\\x3Cscript src="/es6-promise@4.2.5/dist/es6-promise.min.js">\\x3C/script>\\x3Cscript>ES6Promise.polyfill()\\x3C/script>\')';
const fetchShim =
  'window.fetch || document.write(\'\\x3Cscript src="/whatwg-fetch@3.0.0/dist/fetch.umd.js">\\x3C/script>\')';

export default function MainTemplate({
  title,
  description,
  favicon,
  data,
  content,
  entryPoints
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
        <title>{title}</title>
        {x(promiseShim)}
        {x(fetchShim)}
        {data && x(`window.__DATA__ = ${JSON.stringify(data)}`)}
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={content} />
        {entryPoints.module &&
          x(`
          import('${entryPoints.module}');
          window.supportsDynamicImport = true;
        `)}
        {entryPoints.nomodule &&
          x(`
          if (!window.supportsDynamicImport) {
            var s = document.createElement('script');
            s.src = '/systemjs@2.0.0/dist/s.min.js';
            s.addEventListener('load', function() {
              System.import('${entryPoints.nomodule}');
            });
            document.head.appendChild(s);
          }
        `)}
      </body>
    </html>
  );
}

MainTemplate.defaultProps = {
  title: 'UNPKG',
  description: 'The CDN for everything on npm',
  favicon: '/favicon.ico',
  content: createHTML('')
};

if (process.env.NODE_ENV !== 'production') {
  const htmlType = PropTypes.shape({
    __html: PropTypes.string
  });

  MainTemplate.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    favicon: PropTypes.string,
    data: PropTypes.any,
    content: htmlType,
    entryPoints: PropTypes.shape({
      module: PropTypes.string,
      nomodule: PropTypes.string
    }).isRequired
  };
}
