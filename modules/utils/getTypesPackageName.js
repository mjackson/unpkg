export default function getTypesPackageName(packageName) {
  if (packageName.startsWith('@')) {
    const scope = packageName.substring(1, packageName.indexOf('/'));
    const name = packageName.substring(packageName.indexOf('/') + 1);
    return `@types/${scope}__${name}`;
  }

  return `@types/${packageName}`;
}
