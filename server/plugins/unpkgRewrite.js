const URL = require("whatwg-url");
const warning = require("warning");

const config = require("../config");

const bareIdentifierFormat = /^((?:@[^\/]+\/)?[^\/]+)(\/.*)?$/;

function unpkgRewrite(dependencies = {}) {
  return {
    inherits: require("babel-plugin-syntax-export-extensions"),

    visitor: {
      "ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration"(path) {
        if (!path.node.source) return; // probably a variable declaration

        if (
          URL.parseURL(path.node.source.value) != null ||
          path.node.source.value.substr(0, 2) === "//"
        )
          return; // valid URL or URL w/o protocol, leave it alone

        if ([".", "/"].indexOf(path.node.source.value.charAt(0)) >= 0) {
          // local path
          path.node.source.value = `${path.node.source.value}?module`;
        } else {
          // "bare" identifier
          const match = bareIdentifierFormat.exec(path.node.source.value);
          const packageName = match[1];
          const file = match[2] || "";

          warning(
            dependencies[packageName],
            'Missing version info for package "%s" in dependencies; falling back to "latest"',
            packageName
          );

          const version = dependencies[packageName] || "latest";

          path.node.source.value = `${
            config.origin
          }/${packageName}@${version}${file}?module`;
        }
      }
    }
  };
}

module.exports = unpkgRewrite;
