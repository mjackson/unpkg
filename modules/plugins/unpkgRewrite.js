const URL = require("whatwg-url");
const warning = require("warning");

const origin = require("../serverConfig").origin;

const bareIdentifierFormat = /^((?:@[^/]+\/)?[^/]+)(\/.*)?$/;

function isValidURL(value) {
  return URL.parseURL(value) != null;
}

function isProbablyURLWithoutProtocol(value) {
  return value.substr(0, 2) === "//";
}

function isAbsoluteURL(value) {
  return isValidURL(value) || isProbablyURLWithoutProtocol(value);
}

function isBareIdentifier(value) {
  return value.charAt(0) !== "." && value.charAt(0) !== "/";
}

function rewriteValue(/* StringLiteral */ node, dependencies) {
  if (isAbsoluteURL(node.value)) {
    return;
  }

  if (isBareIdentifier(node.value)) {
    // "bare" identifier
    const match = bareIdentifierFormat.exec(node.value);
    const packageName = match[1];
    const file = match[2] || "";

    warning(
      dependencies[packageName],
      'Missing version info for package "%s" in dependencies; falling back to "latest"',
      packageName
    );

    const version = dependencies[packageName] || "latest";

    node.value = `${origin}/${packageName}@${version}${file}?module`;
  } else {
    // local path
    node.value = `${node.value}?module`;
  }
}

function unpkgRewrite(dependencies = {}) {
  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push(
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "importMeta"
      );
    },

    visitor: {
      CallExpression(path) {
        if (path.node.callee.type !== "Import") {
          // Some other function call, not import();
          return;
        }

        rewriteValue(path.node.arguments[0], dependencies);
      },
      ExportAllDeclaration(path) {
        return rewriteValue(path.node.source, dependencies);
      },
      ExportNamedDeclaration(path) {
        if (!path.node.source) {
          // This export has no "source", so it's probably
          // a local variable or function, e.g.
          // export { varName }
          // export const constName = ...
          // export function funcName() {}
          return;
        }

        rewriteValue(path.node.source, dependencies);
      },
      ImportDeclaration(path) {
        return rewriteValue(path.node.source, dependencies);
      }
    }
  };
}

module.exports = unpkgRewrite;
