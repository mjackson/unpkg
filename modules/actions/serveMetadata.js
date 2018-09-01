const path = require("path");

const addLeadingSlash = require("../utils/addLeadingSlash");

function getMatchingEntries(entry, entries) {
  const dirname = entry.name || ".";

  return Object.keys(entries)
    .filter(name => entry.name !== name && path.dirname(name) === dirname)
    .map(name => entries[name]);
}

function getMetadata(entry, entries) {
  const metadata = {
    path: addLeadingSlash(entry.name),
    type: entry.type
  };

  if (entry.type === "file") {
    metadata.contentType = entry.contentType;
    metadata.integrity = entry.integrity;
    metadata.lastModified = entry.lastModified;
    metadata.size = entry.size;
  } else if (entry.type === "directory") {
    metadata.files = getMatchingEntries(entry, entries).map(e =>
      getMetadata(e, entries)
    );
  }

  return metadata;
}

function serveMetadata(req, res) {
  const metadata = getMetadata(req.entry, req.entries);

  res
    .set({
      "Cache-Control": "public, max-age=31536000, immutable", // 1 year
      "Cache-Tag": "meta"
    })
    .send(metadata);
}

module.exports = serveMetadata;
