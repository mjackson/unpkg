import createPackageURL from '../utils/createPackageURL.js';

function filenameRedirect(req, res) {
  let filename;
  if (req.query.module != null) {
    // See https://github.com/rollup/rollup/wiki/pkg.module
    filename = req.packageConfig.module || req.packageConfig['jsnext:main'];

    if (!filename) {
      // https://nodejs.org/api/esm.html#esm_code_package_json_code_code_type_code_field
      if (req.packageConfig.type === 'module') {
        // Use whatever is in pkg.main or index.js
        filename = req.packageConfig.main || '/index.js';
      } else if (
        req.packageConfig.main &&
        /\.mjs$/.test(req.packageConfig.main)
      ) {
        // Use .mjs file in pkg.main
        filename = req.packageConfig.main;
      }
    }

    if (!filename) {
      return res
        .status(404)
        .type('text')
        .send(`Package ${req.packageSpec} does not contain an ES module`);
    }
  } else if (
    req.query.main &&
    req.packageConfig[req.query.main] &&
    typeof req.packageConfig[req.query.main] === 'string'
  ) {
    // Deprecated, see #63
    filename = req.packageConfig[req.query.main];
  } else if (
    req.packageConfig.unpkg &&
    typeof req.packageConfig.unpkg === 'string'
  ) {
    filename = req.packageConfig.unpkg;
  } else if (
    req.packageConfig.browser &&
    typeof req.packageConfig.browser === 'string'
  ) {
    // Deprecated, see #63
    filename = req.packageConfig.browser;
  } else {
    filename = req.packageConfig.main || '/index.js';
  }

  // Redirect to the exact filename so relative imports
  // and URLs resolve correctly.
  res
    .set({
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'Cache-Tag': 'redirect, filename-redirect'
    })
    .redirect(
      302,
      createPackageURL(
        req.packageName,
        req.packageVersion,
        filename.replace(/^[./]*/, '/'),
        req.query
      )
    );
}

/**
 * Redirect to the exact filename if the request omits one.
 */
export default async function validateFilename(req, res, next) {
  if (!req.filename) {
    return filenameRedirect(req, res);
  }

  next();
}
