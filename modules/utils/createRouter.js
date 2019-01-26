import express from 'express';

export default function createRouter(configureRouter) {
  const router = express.Router();
  configureRouter(router);
  return router;
}
