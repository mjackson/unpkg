const MainPage = require("../components/MainPage");
const renderPage = require("../utils/renderPage");

function serveMainPage(req, res) {
  res.send(
    renderPage(MainPage, {
      scripts: req.bundle.getScripts("main"),
      styles: req.bundle.getStyles("main")
    })
  );
}

module.exports = serveMainPage;
