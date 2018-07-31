const MainPage = require("../client/MainPage");
const renderPage = require("../utils/renderPage");

const globalScripts =
  process.env.NODE_ENV === "production"
    ? [
        "/react@16.4.1/umd/react.production.min.js",
        "/react-dom@16.4.1/umd/react-dom.production.min.js",
        "/react-router-dom@4.3.1/umd/react-router-dom.min.js"
      ]
    : [
        "/react@16.4.1/umd/react.development.js",
        "/react-dom@16.4.1/umd/react-dom.development.js",
        "/react-router-dom@4.3.1/umd/react-router-dom.js"
      ];

function serveRootPage(req, res) {
  const scripts = globalScripts.concat(req.assets.getScripts("main"));
  const styles = req.assets.getStyles("main");

  const html = renderPage(MainPage, {
    scripts: scripts,
    styles: styles
  });

  res.send(html);
}

module.exports = serveRootPage;
