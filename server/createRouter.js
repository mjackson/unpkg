const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const renderPage = require("./utils/renderPage");
const requireAuth = require("./middleware/requireAuth");
const MainPage = require("./components/MainPage");

function route(setup) {
  const app = express.Router();
  setup(app);
  return app;
}

function createRouter() {
  const app = express.Router();

  app.get("/", (req, res) => {
    res.send(
      renderPage(MainPage, {
        scripts: req.bundle.getScripts("main"),
        styles: req.bundle.getStyles("main")
      })
    );
  });

  app.use(cors());
  app.use(bodyParser.json());
  app.use(require("./middleware/userToken"));

  app.get("/_publicKey", require("./actions/showPublicKey"));

  app.use(
    "/_auth",
    route(app => {
      app.post("/", require("./actions/createAuth"));
      app.get("/", require("./actions/showAuth"));
    })
  );

  app.use(
    "/_blacklist",
    route(app => {
      app.post(
        "/",
        requireAuth("blacklist.add"),
        require("./actions/addToBlacklist")
      );
      app.get(
        "/",
        requireAuth("blacklist.read"),
        require("./actions/showBlacklist")
      );
      app.delete(
        "*",
        requireAuth("blacklist.remove"),
        require("./middleware/validatePackageURL"),
        require("./actions/removeFromBlacklist")
      );
    })
  );

  if (process.env.NODE_ENV !== "test") {
    app.get("/_stats", require("./actions/showStats"));
  }

  app.get(
    "*",
    require("./middleware/parseURL"),
    require("./middleware/checkBlacklist"),
    require("./middleware/fetchPackage"),
    require("./middleware/findFile"),
    require("./actions/serveFile")
  );

  return app;
}

module.exports = createRouter;
