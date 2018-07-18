const MainPage = require("../components/MainPage");
const renderPage = require("../utils/renderPage");

function serveMainPage(req, res) {
  res.send(
    renderPage(MainPage, {
      scripts: req.assets.getScripts("main"),
      styles: req.assets.getStyles("main")
    })
  );
}

module.exports = serveMainPage;
