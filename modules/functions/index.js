import { https } from 'firebase-functions';

// import serveAuth from './serveAuth';
import serveMainPage from './serveMainPage';
import serveNpmPackageFile from './serveNpmPackageFile';
import servePublicKey from './servePublicKey';
import serveStats from './serveStats';

export default {
  // serveAuth: https.onRequest(serveAuth),
  serveMainPage: https.onRequest(serveMainPage),
  serveNpmPackageFile: https.onRequest(serveNpmPackageFile),
  servePublicKey: https.onRequest(servePublicKey),
  serveStats: https.onRequest(serveStats)
};
