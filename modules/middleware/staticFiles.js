import express from 'express';

const staticMiddleware = express.static('public', { maxAge: '1y' });

export default function staticFiles(req, res, next) {
  if (req.query.meta != null) {
    // Let ?meta requests fall through.
    return next();
  }

  staticMiddleware(req, res, next);
}
