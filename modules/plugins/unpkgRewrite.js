import URL from 'whatwg-url';
import warning from 'warning';
import getTypesPackageName from '../utils/getTypesPackagename';

const bareIdentifierFormat = /^((?:@[^/]+\/)?[^/]+)(\/.*)?$/;

function isValidURL(value) {
  return URL.parseURL(value) != null;
}

function isProbablyURLWithoutProtocol(value) {
  return value.substr(0, 2) === '//';
}

function isAbsoluteURL(value) {
  return isValidURL(value) || isProbablyURLWithoutProtocol(value);
}

function isBareIdentifier(value) {
  return value.charAt(0) !== '.' && value.charAt(0) !== '/';
}

function resolveDependencyNameAndVersion(name, dependencies, isTypeScript) {
  let dependencyName = name;
  let dependencyVersion = dependencies[dependencyName];

  if (!dependencyVersion && isTypeScript) {
    const typesPackageName = getTypesPackageName(dependencyName);
    dependencyVersion = dependencies[typesPackageName];
    if (dependencyVersion) {
      dependencyName = typesPackageName;
    }
  }

  warning(
    dependencyVersion,
    'Missing version info for package "%s" in dependencies; falling back to "latest"',
    dependencyName
  );
  if (!dependencyVersion) {
    dependencyVersion = 'latest';
  }

  return [dependencyName, dependencyVersion];
}

function rewriteValue(
  /* StringLiteral */ node,
  origin,
  dependencies,
  resolveTypes = false,
  isTypeScript = false
) {
  if (isAbsoluteURL(node.value)) {
    return;
  }

  if (isBareIdentifier(node.value)) {
    // "bare" identifier
    const match = bareIdentifierFormat.exec(node.value);
    const packageName = match[1];
    const file = match[2] || '';

    const [dependencyName, dependencyVersion] = resolveDependencyNameAndVersion(
      packageName,
      dependencies,
      isTypeScript
    );

    node.value = `${origin}/${dependencyName}@${dependencyVersion}${file}?module${
      resolveTypes ? '&types' : ''
    }`;
  } else {
    // local path
    node.value = `${node.value}?module${resolveTypes ? '&types' : ''}`;
  }
}

export default function unpkgRewrite(
  origin,
  dependencies = {},
  resolveTypes = false,
  isTypeScript = false
) {
  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push(
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'importMeta'
      );
      if (isTypeScript) parserOpts.plugins.push('typescript');
    },

    visitor: {
      CallExpression(path) {
        if (path.node.callee.type !== 'Import') {
          // Some other function call, not import();
          return;
        }

        rewriteValue(
          path.node.arguments[0],
          origin,
          dependencies,
          resolveTypes,
          isTypeScript
        );
      },
      ExportAllDeclaration(path) {
        rewriteValue(
          path.node.source,
          origin,
          dependencies,
          resolveTypes,
          isTypeScript
        );
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

        rewriteValue(
          path.node.source,
          origin,
          dependencies,
          resolveTypes,
          isTypeScript
        );
      },
      ImportDeclaration(path) {
        rewriteValue(
          path.node.source,
          origin,
          dependencies,
          resolveTypes,
          isTypeScript
        );
      }
    }
  };
}
