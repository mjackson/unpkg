import express from 'express';

import serveDirectoryBrowser from './actions/serveDirectoryBrowser.js';
import serveDirectoryMetadata from './actions/serveDirectoryMetadata.js';
import serveFileBrowser from './actions/serveFileBrowser.js';
import serveFileMetadata from './actions/serveFileMetadata.js';
import serveFile from './actions/serveFile.js';
import serveMainPage from './actions/serveMainPage.js';
import serveModule from './actions/serveModule.js';
import serveStats from './actions/serveStats.js';

import cors from './middleware/cors.js';
import findEntry from './middleware/findEntry.js';
import logger from './middleware/logger.js';
import redirectLegacyURLs from './middleware/redirectLegacyURLs.js';
import staticFiles from './middleware/staticFiles.js';
import validateFilename from './middleware/validateFilename.js';
import validatePackageURL from './middleware/validatePackageURL.js';
import validatePackageName from './middleware/validatePackageName.js';
import validateQuery from './middleware/validateQuery.js';
import validateVersion from './middleware/validateVersion.js';

function createApp(callback) {
  const app = express();
  callback(app);
  return app;
}

export default function createServer() {
  return createApp(app => {
    app.disable('x-powered-by');
    app.enable('trust proxy');
    app.enable('strict routing');

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

    app.use(
      '/browse',
      createApp(app => {
        app.enable('strict routing');

        app.get(
          '*/',
          validatePackageURL,
          validatePackageName,
          validateQuery,
          validateVersion,
          serveDirectoryBrowser
        );

        app.get(
          '*',
          validatePackageURL,
          validatePackageName,
          validateQuery,
          validateVersion,
          serveFileBrowser
        );
      })
    );

    // We need to route in this weird way because Express
    // doesn't have a way to route based on query params.
    const metadataApp = createApp(app => {
      app.enable('strict routing');

      app.get(
        '*/',
        validatePackageURL,
        validatePackageName,
        validateQuery,
        validateVersion,
        validateFilename,
        serveDirectoryMetadata
      );

      app.get(
        '*',
        validatePackageURL,
        validatePackageName,
        validateQuery,
        validateVersion,
        validateFilename,
        serveFileMetadata
      );
    });

    app.use((req, res, next) => {
      if (req.query.meta != null) {
        metadataApp(req, res);
      } else {
        next();
      }
    });

    const moduleApp = createApp(app => {
      app.enable('strict routing');

      app.get(
        '*',
        validatePackageURL,
        validatePackageName,
        validateQuery,
        validateVersion,
        validateFilename,
        findEntry,
        serveModule
      );
    });

    app.use((req, res, next) => {
      if (req.query.module != null) {
        moduleApp(req, res);
      } else {
        next();
      }
    });

    // Send old */ requests to the new /browse UI.
    app.get('*/', (req, res) => {
      res.redirect(302, '/browse' + req.url);
    });

    app.get(
      '*',
      validatePackageURL,
      validatePackageName,
      validateQuery,
      validateVersion,
      validateFilename,
      findEntry,
      serveFile
    );
  });
}
