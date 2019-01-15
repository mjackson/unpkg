import morgan from 'morgan';

const logging = morgan(
  process.env.NODE_ENV === 'development'
    ? 'dev'
    : ':date[clf] - :method :url :status :res[content-length] - :response-time ms',
  {
    skip:
      process.env.NODE_ENV === 'production'
        ? (req, res) => res.statusCode < 400 // Log only errors in production
        : () => process.env.NODE_ENV === 'test' // Skip logging in test env
  }
);

export default logging;
