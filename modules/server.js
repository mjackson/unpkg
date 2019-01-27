import express from 'express';

// import serveAuth from './actions/serveAuth';
import serveFile from './actions/serveFile';
import serveMainPage from './actions/serveMainPage';
import servePublicKey from './actions/servePublicKey';
import serveStats from './actions/serveStats';

import cors from './middleware/cors';
import fetchPackage from './middleware/fetchPackage';
import findFile from './middleware/findFile';
import logger from './middleware/logger';
import redirectLegacyURLs from './middleware/redirectLegacyURLs';
import staticFiles from './middleware/staticFiles';
// import userToken from './middleware/userToken';
import validatePackageURL from './middleware/validatePackageURL';
import validatePackageName from './middleware/validatePackageName';
import validateQuery from './middleware/validateQuery';

import createRouter from './utils/createRouter';

const port = process.env.PORT || '8080';

const app = express();

app.disable('x-powered-by');
app.enable('trust proxy');

app.use(logger);
app.use(staticFiles);

app.get('/', serveMainPage);

app.use(redirectLegacyURLs);
app.use(cors);

app.use(
  '/api',
  createRouter(app => {
    // app.get('/auth', userToken, serveAuth);
    app.get('/public-key', servePublicKey);
    app.get('/stats', serveStats);
  })
);

app.get(
  '*',
  validatePackageURL,
  validatePackageName,
  validateQuery,
  fetchPackage,
  findFile,
  serveFile
);

app.listen(port, () => {
  console.log('Server listening on port %s, Ctrl+C to quit', port);
});
