const React = require("react");
const PropTypes = require("prop-types");

const e = React.createElement;

function MainPage({
  title,
  description,
  scripts,
  styles,
  webpackManifest,
  content
}) {
  return e(
    "html",
    { lang: "en" },
    e(
      "head",
      null,
      e("meta", { charSet: "utf-8" }),
      e("title", null, title),
      e("meta", { httpEquiv: "X-UA-Compatible", content: "IE=edge,chrome=1" }),
      e("meta", { name: "description", content: description }),
      e("meta", {
        name: "viewport",
        content: "width=device-width,initial-scale=1,maximum-scale=1"
      }),
      e("meta", { name: "timestamp", content: new Date().toISOString() }),
      e("link", { rel: "shortcut icon", href: "/favicon.ico" }),
      e("script", {
        dangerouslySetInnerHTML: {
          __html:
            "window.Promise || document.write('\\x3Cscript src=\"/_polyfills/es6-promise.min.js\">\\x3C/script>\\x3Cscript>ES6Promise.polyfill()\\x3C/script>')"
        }
      }),
      e("script", {
        dangerouslySetInnerHTML: {
          __html:
            "window.fetch || document.write('\\x3Cscript src=\"/_polyfills/fetch.min.js\">\\x3C/script>')"
        }
      }),
      e("script", {
        dangerouslySetInnerHTML: {
          __html: "window.webpackManifest = " + JSON.stringify(webpackManifest)
        }
      }),
      styles.map(s => e("link", { key: s, rel: "stylesheet", href: s }))
    ),
    e(
      "body",
      null,
      e("div", { id: "app", dangerouslySetInnerHTML: { __html: content } }),
      scripts.map(s => e("script", { key: s, src: s }))
    )
  );
}

MainPage.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  scripts: PropTypes.arrayOf(PropTypes.string),
  styles: PropTypes.arrayOf(PropTypes.string),
  webpackManifest: PropTypes.object,
  content: PropTypes.string
};

MainPage.defaultProps = {
  title: "UNPKG",
  description: "The CDN for everything on npm",
  scripts: [],
  styles: [],
  webpackManifest: {},
  content: ""
};

module.exports = MainPage;
