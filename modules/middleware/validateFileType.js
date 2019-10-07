import tar from 'tar-stream';

import asyncHandler from '../utils/asyncHandler.js';
import { getPackage } from '../utils/npm.js';
import createPackageURL from '../utils/createPackageURL.js';

async function findEntryType(stream, filename) {
  // filename = /some/file/name.js
  return new Promise((accept, reject) => {
    let hasFoundFile = false;

    stream
      .pipe(tar.extract())
      .on('error', reject)
      .on('entry', async (header, stream, next) => {
        if (hasFoundFile) {
          next();
        }

        const entry = {
          // Most packages have header names that look like `package/index.js`
          // so we shorten that to just `/index.js` here. A few packages use a
          // prefix other than `package/`. e.g. the firebase package uses the
          // `firebase_npm/` prefix. So we just strip the first dir name.
          path: header.name.replace(/^[^/]+\/?/, '/'),
          type: header.type
        };

        // Ignore files that don't match the name.
        if (entry.type !== 'file' || entry.path !== filename) {
          stream.resume();
          stream.on('end', next);
        } else {
          hasFoundFile = true;

          next();
        }
      })
      .on('finish', () => {
        accept(hasFoundFile ? 'file' : 'directory');
      });
  });
}

async function validateFileType(req, res, next) {
  if (!req.filename) {
    req.fileType = 'directory';
  }

  const stream = await getPackage(req.packageName, req.packageVersion, req.log);

  const entryType = await findEntryType(stream, req.filename);

  req.type = entryType;

  if (req.type === 'directory' && req.filename.slice(-1) !== '/') {
    // If there is no trailing slash, redirect to the one that have
    return res
      .set({
        'Cache-Control': 'public, max-age=31536000', // 1 year
        'Cache-Tag': 'redirect, filename-redirect'
      })
      .redirect(
        301,
        createPackageURL(
          req.packageName,
          req.packageVersion,
          req.filename.replace(/^\/+/, '/') + '/',
          req.query
        )
      );
  }

  next();
}

export default asyncHandler(validateFileType);
