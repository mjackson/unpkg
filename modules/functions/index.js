import { https } from 'firebase-functions';

// import serveAuth from './serveAuth';
import serveAutoIndexPage from './serveAutoIndexPage';
import serveNpmPackageFile from './serveNpmPackageFile';
import servePublicKey from './servePublicKey';
import serveStats from './serveStats';

export default {
  // serveAuth: https.onRequest(serveAuth),
  serveAutoIndexPage: https.onRequest(serveAutoIndexPage),
  serveNpmPackageFile: https.onRequest(serveNpmPackageFile),
  servePublicKey: https.onRequest(servePublicKey),
  serveStats: https.onRequest(serveStats)
};
