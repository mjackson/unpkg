import PropTypes from 'prop-types';

import {
  createElement as e,
  createHTML as h,
  createScript as x
} from '../utils/markup.js';

export default function MainTemplate({
  title = 'UNPKG',
  description = 'The CDN for everything on npm',
  favicon = '/favicon.ico',
  content = h(''),
  elements = []
}) {
  return e(
    'html',
    { lang: 'en' },
    e(
      'head',
      null,
      // Global site tag (gtag.js) - Google Analytics
      e('script', {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=UA-140352188-1'
      }),
      x(`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-140352188-1');`),
      e('meta', { charSet: 'utf-8' }),
      e('meta', { httpEquiv: 'X-UA-Compatible', content: 'IE=edge,chrome=1' }),
      description && e('meta', { name: 'description', content: description }),
      e('meta', {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1,maximum-scale=1'
      }),
      e('meta', { name: 'timestamp', content: new Date().toISOString() }),
      favicon && e('link', { rel: 'shortcut icon', href: favicon }),
      e('title', null, title)
    ),
    e('body', null, e('div', { id: 'root' }, content), ...elements)
  );
}

if (process.env.NODE_ENV !== 'production') {
  const htmlType = PropTypes.shape({
    __html: PropTypes.string
  });

  MainTemplate.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    favicon: PropTypes.string,
    content: htmlType,
    elements: PropTypes.arrayOf(PropTypes.node)
  };
}
