const path = require("path");
const throng = require("throng");

const createServer = require("./modules/createServer");
const createDevServer = require("./modules/createDevServer");
const serverConfig = require("./modules/serverConfig");

require("./modules/clientRuntime");

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
}

throng({
  workers: process.env.WEB_CONCURRENCY || 1,
  start: startServer,
  lifetime: Infinity,

  // In production, increase throng's default grace period to allow
  // servers that are still handling requests to finish. Heroku shuts
  // down processes forcefully after 30 seconds, so exit before that
  // happens to avoid an exit timeout.
  // https://devcenter.heroku.com/articles/dynos#shutdown
  grace: process.env.NODE_ENV === "production" ? 25000 : 5000
});
