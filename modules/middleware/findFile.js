const path = require('path');

const addLeadingSlash = require('../utils/addLeadingSlash');
const createPackageURL = require('../utils/createPackageURL');
const createSearch = require('../utils/createSearch');
const fetchNpmPackage = require('../utils/fetchNpmPackage');
const getIntegrity = require('../utils/getIntegrity');
const getContentType = require('../utils/getContentType');

function indexRedirect(req, res, entry) {
  // Redirect to the index file so relative imports
  // resolve correctly.
  res
    .set({
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Cache-Tag': 'redirect, index-redirect'
    })
    .redirect(
      302,
      createPackageURL(
        req.packageName,
        req.packageVersion,
        addLeadingSlash(entry.name),
        createSearch(req.query)
      )
    );
}

function stripLeadingSegment(name) {
  return name.replace(/^[^/]+\/?/, '');
}

function searchEntries(tarballStream, entryName, wantsIndex) {
  return new Promise((resolve, reject) => {
    const entries = {};
    let foundEntry = null;

    if (entryName === '') {
      foundEntry = entries[''] = { name: '', type: 'directory' };
    }

    tarballStream
      .on('error', reject)
      .on('finish', () => resolve({ entries, foundEntry }))
      .on('entry', (header, stream, next) => {
        const entry = {
          // Most packages have header names that look like `package/index.js`
          // so we shorten that to just `index.js` here. A few packages use a
          // prefix other than `package/`. e.g. the firebase package uses the
          // `firebase_npm/` prefix. So we just strip the first dir name.
          name: stripLeadingSegment(header.name),
          type: header.type
        };

        // We are only interested in files that match the entryName.
        if (entry.type !== 'file' || entry.name.indexOf(entryName) !== 0) {
          stream.resume();
          stream.on('end', next);
          return;
        }

        entries[entry.name] = entry;

        // Dynamically create "directory" entries for all directories
        // that are in this file's path. Some tarballs omit these entries
        // for some reason, so this is the brute force method.
        let dirname = path.dirname(entry.name);
        while (dirname !== '.') {
          const directoryEntry = { name: dirname, type: 'directory' };

          if (!entries[dirname]) {
            entries[dirname] = directoryEntry;

            if (directoryEntry.name === entryName) {
              foundEntry = directoryEntry;
            }
          }

          dirname = path.dirname(dirname);
        }

        // Set the foundEntry variable if this entry name
        // matches exactly or if it's an index.html file
        // and the client wants HTML.
        if (
          entry.name === entryName ||
          // Allow accessing e.g. `/index.js` or `/index.json` using
          // `/index` for compatibility with CommonJS
          (!wantsIndex && entry.name === `${entryName}.js`) ||
          (!wantsIndex && entry.name === `${entryName}.json`)
        ) {
          foundEntry = entry;
        }

        const chunks = [];

        stream.on('data', chunk => chunks.push(chunk)).on('end', () => {
          const content = Buffer.concat(chunks);

          // Set some extra properties for files that we will
          // need to serve them and for ?meta listings.
          entry.contentType = getContentType(entry.name);
          entry.integrity = getIntegrity(content);
          entry.lastModified = header.mtime.toUTCString();
          entry.size = content.length;

          // Set the content only for the foundEntry and
          // discard the buffer for all others.
          if (entry === foundEntry) {
            entry.content = content;
          }

          next();
        });
      });
  });
}

const leadingSlash = /^\//;
const trailingSlash = /\/$/;

/**
 * Fetch and search the archive to try and find the requested file.
 * Redirect to the "index" file if a directory was requested.
 */
function findFile(req, res, next) {
  fetchNpmPackage(req.packageConfig).then(tarballStream => {
    const entryName = req.filename
      .replace(trailingSlash, '')
      .replace(leadingSlash, '');
    const wantsIndex = trailingSlash.test(req.filename);

    searchEntries(tarballStream, entryName, wantsIndex).then(
      ({ entries, foundEntry }) => {
        if (!foundEntry) {
          return res
            .status(404)
            .type('text')
            .send(`Cannot find "${req.filename}" in ${req.packageSpec}`);
        }

        // If the foundEntry is a directory and there is no trailing slash
        // on the request path, we need to redirect to some "index" file
        // inside that directory. This is so our URLs work in a similar way
        // to require("lib") in node where it searches for `lib/index.js`
        // and `lib/index.json` when `lib` is a directory.
        if (foundEntry.type === 'directory' && !wantsIndex) {
          const indexEntry =
            entries[path.join(entryName, 'index.js')] ||
            entries[path.join(entryName, 'index.json')];

          if (indexEntry && indexEntry.type === 'file') {
            return indexRedirect(req, res, indexEntry);
          } else {
            return res
              .status(404)
              .type('text')
              .send(
                `Cannot find an index in "${req.filename}" in ${
                  req.packageSpec
                }`
              );
          }
        }

        req.entries = entries;
        req.entry = foundEntry;

        next();
      }
    );
  });
}

module.exports = findFile;
