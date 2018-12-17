const http = require('http');
const express = require('express');
const morgan = require('morgan');
const raven = require('raven');

const staticAssets = require('./middleware/staticAssets');
const createRouter = require('./createRouter');

morgan.token('fwd', req => {
  const fwd = req.get('x-forwarded-for');
  return fwd ? fwd.replace(/\s/g, '') : '-';
});

if (process.env.SENTRY_DSN) {
  raven
    .config(process.env.SENTRY_DSN, {
      release: process.env.HEROKU_RELEASE_VERSION,
      autoBreadcrumbs: true
    })
    .install();
}

// function errorHandler(err, req, res, next) {
//   console.error(err.stack);

//   res
//     .status(500)
//     .type("text")
//     .send("Internal Server Error");

//   next(err);
// }

function createServer(publicDir, statsFile) {
  const app = express();

  app.disable('x-powered-by');

  if (process.env.SENTRY_DSN) {
    app.use(raven.requestHandler());
  }

  if (process.env.NODE_ENV !== 'test') {
    app.use(
      morgan(
        // Modified version of Heroku's log format
        // https://devcenter.heroku.com/articles/http-routing#heroku-router-log-format
        'method=:method path=":url" host=:req[host] request_id=:req[x-request-id] cf_ray=:req[cf-ray] fwd=:fwd status=:status bytes=:res[content-length]'
      )
    );
  }

  // app.use(errorHandler);

  if (publicDir) {
    app.use(express.static(publicDir, { maxAge: '365d' }));
  }

  if (statsFile) {
    app.use(staticAssets(statsFile));
  }

  app.use(createRouter());

  if (process.env.SENTRY_DSN) {
    app.use(raven.errorHandler());
  }

  const server = http.createServer(app);

  // Heroku dynos automatically timeout after 30s. Set our
  // own timeout here to force sockets to close before that.
  // https://devcenter.heroku.com/articles/request-timeout
  server.setTimeout(25000, socket => {
    const message = `Timeout of 25 seconds exceeded`;

    socket.end(
      [
        'HTTP/1.1 503 Service Unavailable',
        'Date: ' + new Date().toGMTString(),
        'Content-Length: ' + Buffer.byteLength(message),
        'Content-Type: text/plain',
        'Connection: close',
        '',
        message
      ].join('\r\n')
    );
  });

  return server;
}

module.exports = createServer;
