const log = console.log.bind(console);

function noop() {}

let debug, info, warn;

if (process.env.LOG_LEVEL === "none") {
  debug = info = warn = noop;
} else if (process.env.LOG_LEVEL === "debug") {
  debug = info = warn = log;
} else if (process.env.LOG_LEVEL === "warn") {
  debug = info = noop;
  warn = log;
} else {
  // default LOG_LEVEL = "info"
  debug = noop;
  info = warn = log;
}

module.exports = {
  debug,
  info,
  warn
};
