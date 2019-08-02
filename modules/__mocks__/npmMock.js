import fs from 'fs';
import path from 'path';
import gunzip from 'gunzip-maybe';

function getPackageInfo(packageName) {
  const file = path.resolve(__dirname, `./metadata/${packageName}.json`);

  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (error) {
    return null;
  }
}

export function getVersionsAndTags(packageName) {
  const info = getPackageInfo(packageName);
  return info
    ? { versions: Object.keys(info.versions), tags: info['dist-tags'] }
    : [];
}

export function getPackageConfig(packageName, version) {
  const info = getPackageInfo(packageName);
  return info ? info.versions[version] : null;
}

export function getPackage(packageName, version) {
  const file = path.resolve(
    __dirname,
    `./packages/${packageName}-${version}.tgz`
  );

  return fs.existsSync(file) ? fs.createReadStream(file).pipe(gunzip()) : null;
}
