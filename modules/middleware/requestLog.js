import util from 'util';

const enableDebugging = process.env.DEBUG != null;

function noop() {}

function createLog(req) {
  return {
    debug: enableDebugging
      ? (format, ...args) => {
          console.log(util.format(format, ...args));
        }
      : noop,
    info: (format, ...args) => {
      console.log(util.format(format, ...args));
    },
    error: (format, ...args) => {
      console.error(util.format(format, ...args));
    }
  };
}

export default function requestLog(req, res, next) {
  req.log = createLog(req);
  next();
}
