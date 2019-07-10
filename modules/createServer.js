import express from 'express';

import serveFile from './actions/serveFile.js';
import serveMainPage from './actions/serveMainPage.js';
import serveStats from './actions/serveStats.js';

import cors from './middleware/cors.js';
import fetchPackage from './middleware/fetchPackage.js';
import findFile from './middleware/findFile.js';
import logger from './middleware/logger.js';
import redirectLegacyURLs from './middleware/redirectLegacyURLs.js';
import staticFiles from './middleware/staticFiles.js';
import validatePackageURL from './middleware/validatePackageURL.js';
import validatePackageName from './middleware/validatePackageName.js';
import validateQuery from './middleware/validateQuery.js';

export default function createServer() {
  const app = express();

  app.disable('x-powered-by');
  app.enable('trust proxy');

  app.use(logger);
  app.use(cors);
  app.use(staticFiles);

  // Special startup request from App Engine
  // https://cloud.google.com/appengine/docs/standard/nodejs/how-instances-are-managed
  app.get('/_ah/start', (req, res) => {
    res.status(200).end();
  });

  app.get('/', serveMainPage);
  app.get('/api/stats', serveStats);

  app.use(redirectLegacyURLs);

  app.get(
    '*',
    validatePackageURL,
    validatePackageName,
    validateQuery,
    fetchPackage,
    findFile,
    serveFile
  );

  return app;
}
