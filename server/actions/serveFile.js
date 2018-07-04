const fs = require("fs");
const path = require("path");
const etag = require("etag");
const babel = require("babel-core");

const IndexPage = require("../components/IndexPage");
const unpkgRewrite = require("../plugins/unpkgRewrite");
const addLeadingSlash = require("../utils/addLeadingSlash");
const renderPage = require("../utils/renderPage");

function getContentTypeHeader(type) {
  return type === "application/javascript" ? type + "; charset=utf-8" : type;
}

function getMetadata(entry, entries) {
  const metadata = Object.assign(
    {
      path: addLeadingSlash(entry.name)
    },
    entry.type === "file"
      ? {
          type: entry.type,
          contentType: entry.contentType,
          integrity: entry.integrity,
          lastModified: entry.lastModified,
          size: entry.size
        }
      : {
          type: entry.type
        }
  );

  if (entry.type === "directory") {
    metadata.files = Object.keys(entries)
      .filter(
        name =>
          name !== entry.name && path.dirname(name) === (entry.name || ".")
      )
      .map(name => getMetadata(entries[name], entries));
  }

  return metadata;
}

function serveMetadata(req, res) {
  const metadata = getMetadata(req.entry, req.entries);

  res
    .set({
      "Cache-Control": "public,max-age=31536000", // 1 year
      "Cache-Tag": "meta"
    })
    .send(metadata);
}

function rewriteBareModuleIdentifiers(code, packageConfig) {
  const dependencies = Object.assign(
    {},
    packageConfig.peerDependencies,
    packageConfig.dependencies
  );

  const options = {
    // Ignore .babelrc and package.json babel config
    // because we haven't installed dependencies so
    // we can't load plugins; see #84
    babelrc: false,
    plugins: [unpkgRewrite(dependencies)]
  };

  return babel.transform(code, options).code;
}

function serveJavaScriptModule(req, res) {
  if (req.entry.contentType !== "application/javascript") {
    return res
      .status(403)
      .type("text")
      .send("?module mode is available only for JavaScript files");
  }

  try {
    const code = rewriteBareModuleIdentifiers(
      req.entry.content.toString("utf8"),
      req.packageConfig
    );

    res
      .set({
        "Content-Length": Buffer.byteLength(code),
        "Content-Type": getContentTypeHeader(req.entry.contentType),
        "Cache-Control": "public,max-age=31536000", // 1 year
        ETag: etag(code),
        "Cache-Tag": "file,js-file,js-module"
      })
      .send(code);
  } catch (error) {
    console.error(error);

    const errorName = error.constructor.name;
    const errorMessage = error.message.replace(
      /^.*?\/unpkg-.+?\//,
      `/${req.packageSpec}/`
    );
    const codeFrame = error.codeFrame;
    const debugInfo = `${errorName}: ${errorMessage}\n\n${codeFrame}`;

    res
      .status(500)
      .type("text")
      .send(
        `Cannot generate module for ${req.packageSpec}${
          req.filename
        }\n\n${debugInfo}`
      );
  }
}

function serveStaticFile(req, res) {
  const tags = ["file"];

  const ext = path.extname(req.entry.name).substr(1);
  if (ext) {
    tags.push(`${ext}-file`);
  }

  res
    .set({
      "Content-Length": req.entry.size,
      "Content-Type": getContentTypeHeader(req.entry.contentType),
      "Cache-Control": "public,max-age=31536000", // 1 year
      "Last-Modified": req.entry.lastModified,
      ETag: etag(req.entry.content),
      "Cache-Tag": tags.join(",")
    })
    .send(req.entry.content);
}

function serveIndex(req, res) {
  const html = renderPage(IndexPage, {
    packageInfo: req.packageInfo,
    version: req.packageVersion,
    filename: req.filename,
    entries: req.entries,
    entry: req.entry
  });

  res
    .set({
      "Cache-Control": "public,max-age=60", // 1 minute
      "Cache-Tag": "index"
    })
    .send(html);
}

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
function serveFile(req, res) {
  if (req.query.meta != null) {
    return serveMetadata(req, res);
  }

  if (req.entry.type === "directory") {
    return serveIndex(req, res);
  }

  if (req.query.module != null) {
    return serveJavaScriptModule(req, res);
  }

  serveStaticFile(req, res);
}

module.exports = serveFile;
