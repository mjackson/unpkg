const path = require("path");
const throng = require("throng");

const createServer = require("./server/createServer");
const createDevServer = require("./server/createDevServer");
const config = require("./server/config");

function startServer(id) {
  const server =
    process.env.NODE_ENV === "production"
      ? createServer(
          path.resolve(__dirname, "public"),
          path.resolve(__dirname, "server/stats.json")
        )
      : createDevServer(
          path.resolve(__dirname, "public"),
          require("./webpack.config"),
          config.origin
        );

  server.listen(config.port, () => {
    console.log(
      "Server #%s listening on port %s, Ctrl+C to stop",
      id,
      config.port
    );
  });
}

throng({
  workers: process.env.WEB_CONCURRENCY || 1,
  lifetime: Infinity,
  grace: 25000,
  start: startServer
});
