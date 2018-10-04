const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

function route(setup) {
  const app = express.Router();
  setup(app);
  return app;
}

function createRouter() {
  const app = express.Router();

  app.get("/", require("./actions/serveRootPage"));

  app.use(cors());
  app.use(bodyParser.json());
  app.use(require("./middleware/userToken"));

  app.use(
    "/api",
    route(app => {
      app.get("/publicKey", require("./actions/showPublicKey"));

      app.post("/auth", require("./actions/createAuth"));
      app.get("/auth", require("./actions/showAuth"));

      app.post(
        "/blacklist",
        require("./middleware/requireAuth")("blacklist.add"),
        require("./actions/addToBlacklist")
      );
      app.get(
        "/blacklist",
        require("./middleware/requireAuth")("blacklist.read"),
        require("./actions/showBlacklist")
      );
      app.delete(
        "/blacklist",
        require("./middleware/requireAuth")("blacklist.remove"),
        require("./actions/removeFromBlacklist")
      );

      // if (process.env.NODE_ENV !== "test") {
      //   app.get("/stats", require("./actions/showStats"));
      // }
    })
  );

  // TODO: Remove
  app.get("/_publicKey", require("./actions/showPublicKey"));

  // TODO: Remove
  app.use(
    "/_auth",
    route(app => {
      app.post("/", require("./actions/createAuth"));
      app.get("/", require("./actions/showAuth"));
    })
  );

  // TODO: Remove
  app.use(
    "/_blacklist",
    route(app => {
      app.post(
        "/",
        require("./middleware/requireAuth")("blacklist.add"),
        require("./actions/addToBlacklist")
      );
      app.get(
        "/",
        require("./middleware/requireAuth")("blacklist.read"),
        require("./actions/showBlacklist")
      );
      app.delete(
        "*",
        require("./middleware/requireAuth")("blacklist.remove"),
        require("./middleware/validatePackageURL"),
        require("./actions/removeFromBlacklist")
      );
    })
  );

  // TODO: Remove
  // if (process.env.NODE_ENV !== "test") {
  //   app.get("/_stats", require("./actions/showStats"));
  // }

  app.get(
    "*",
    require("./middleware/redirectLegacyURLs"),
    require("./middleware/validatePackageURL"),
    require("./middleware/validatePackageName"),
    require("./middleware/validateQuery"),
    require("./middleware/checkBlacklist"),
    require("./middleware/fetchPackage"),
    require("./middleware/findFile"),
    require("./actions/serveFile")
  );

  return app;
}

module.exports = createRouter;
