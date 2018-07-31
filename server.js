const path = require("path");
const throng = require("throng");
const raven = require("raven");

const createServer = require("./modules/createServer");
const createDevServer = require("./modules/createDevServer");
const serverConfig = require("./modules/serverConfig");

require("./modules/clientRuntime");

if (process.env.SENTRY_DSN) {
  raven
    .config(process.env.SENTRY_DSN, {
      release: process.env.HEROKU_RELEASE_VERSION
    })
    .install();
}

function startServer(id) {
  const server =
    process.env.NODE_ENV === "production"
      ? createServer(
          path.resolve(__dirname, "public"),
          path.resolve(__dirname, "stats.json")
        )
      : createDevServer(
          path.resolve(__dirname, "public"),
          require("./webpack.config"),
          serverConfig.origin
        );

  server.listen(serverConfig.port, () => {
    console.log(
      "Server #%s listening on port %s, Ctrl+C to stop",
      id,
      serverConfig.port
    );
  });

  server.timeout = 10000;
}

throng({
  workers: process.env.WEB_CONCURRENCY || 1,
  lifetime: Infinity,
  grace: 11000,
  start: startServer
});
