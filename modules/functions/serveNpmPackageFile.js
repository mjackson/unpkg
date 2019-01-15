import express from 'express';
import cors from 'cors';

// import checkBlacklist from '../middleware/checkBlacklist';
import fetchPackage from '../middleware/fetchPackage';
import findFile from '../middleware/findFile';
import redirectLegacyURLs from '../middleware/redirectLegacyURLs';
import validatePackageURL from '../middleware/validatePackageURL';
import validatePackageName from '../middleware/validatePackageName';
import validateQuery from '../middleware/validateQuery';
import serveFile from '../actions/serveFile';

const app = express.Router();

app.use(cors());
app.use(redirectLegacyURLs);
app.use(validatePackageURL);
app.use(validatePackageName);
app.use(validateQuery);
// app.use(checkBlacklist);
app.use(fetchPackage);
app.use(findFile);
app.use(serveFile);

export default app;
