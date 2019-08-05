import util from 'util';

// https://cloud.google.com/appengine/docs/standard/nodejs/runtime#environment_variables
const projectId = process.env.GOOGLE_CLOUD_PROJECT;

const enableDebugging = process.env.DEBUG != null;

function noop() {}

function createLog(req) {
  const traceContext = req.headers['x-cloud-trace-context'];

  if (projectId && traceContext) {
    const [traceId, spanId] = traceContext.split('/');
    const trace = `projects/${projectId}/traces/${traceId}`;

    return {
      debug: enableDebugging
        ? (format, ...args) => {
            console.log(
              JSON.stringify({
                severity: 'DEBUG',
                'logging.googleapis.com/trace': trace,
                'logging.googleapis.com/spanId': spanId,
                message: util.format(format, ...args)
              })
            );
          }
        : noop,
      info: (format, ...args) => {
        console.log(
          JSON.stringify({
            severity: 'INFO',
            'logging.googleapis.com/trace': trace,
            'logging.googleapis.com/spanId': spanId,
            message: util.format(format, ...args)
          })
        );
      },
      error: (format, ...args) => {
        console.error(
          JSON.stringify({
            severity: 'ERROR',
            'logging.googleapis.com/trace': trace,
            'logging.googleapis.com/spanId': spanId,
            message: util.format(format, ...args)
          })
        );
      }
    };
  }

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
