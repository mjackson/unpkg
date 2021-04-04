import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import serveDirectoryBrowser from './actions/serveDirectoryBrowser.js';
import serveDirectoryMetadata from './actions/serveDirectoryMetadata.js';
import serveFileBrowser from './actions/serveFileBrowser.js';
import serveFileMetadata from './actions/serveFileMetadata.js';
import serveFile from './actions/serveFile.js';
import serveMainPage from './actions/serveMainPage.js';
import serveModule from './actions/serveModule.js';
import serveStats from './actions/serveStats.js';

import allowQuery from './middleware/allowQuery.js';
import findEntry from './middleware/findEntry.js';
import noQuery from './middleware/noQuery.js';
import redirectLegacyURLs from './middleware/redirectLegacyURLs.js';
import requestLog from './middleware/requestLog.js';
import validateFilename from './middleware/validateFilename.js';
import validatePackagePathname from './middleware/validatePackagePathname.js';
import validatePackageName from './middleware/validatePackageName.js';
import validatePackageVersion from './middleware/validatePackageVersion.js';

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

    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    app.use(cors());
    app.use(express.static('public', { maxAge: '1y' }));

    app.use(requestLog);

    app.get('/', serveMainPage);
    app.get('/api/stats', serveStats);

    app.use(redirectLegacyURLs);

    app.use(
      '/browse',
      createApp(app => {
        app.enable('strict routing');

        app.get(
          '*/',
          noQuery(),
          validatePackagePathname,
          validatePackageName,
          validatePackageVersion,
          serveDirectoryBrowser
        );

        app.get(
          '*',
          noQuery(),
          validatePackagePathname,
          validatePackageName,
          validatePackageVersion,
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
        allowQuery('meta'),
        validatePackagePathname,
        validatePackageName,
        validatePackageVersion,
        validateFilename,
        serveDirectoryMetadata
      );

      app.get(
        '*',
        allowQuery('meta'),
        validatePackagePathname,
        validatePackageName,
        validatePackageVersion,
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

    // We need to route in this weird way because Express
    // doesn't have a way to route based on query params.
    const moduleApp = createApp(app => {
      app.enable('strict routing');

      app.get(
        '*',
        allowQuery('module'),
        validatePackagePathname,
        validatePackageName,
        validatePackageVersion,
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
      noQuery(),
      validatePackagePathname,
      validatePackageName,
      validatePackageVersion,
      validateFilename,
      findEntry,
      serveFile
    );
  });
}
