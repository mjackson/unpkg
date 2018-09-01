const etag = require("etag");
const babel = require("babel-core");

const getContentTypeHeader = require("../utils/getContentTypeHeader");
const unpkgRewrite = require("../plugins/unpkgRewrite");

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
        "Cache-Control": "public, max-age=31536000, immutable", // 1 year
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

module.exports = serveJavaScriptModule;
