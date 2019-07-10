import url from 'url';
import https from 'https';
import gunzip from 'gunzip-maybe';
import tar from 'tar-stream';
import LRUCache from 'lru-cache';

import debug from './debug.js';
import bufferStream from './bufferStream.js';

const npmRegistryURL =
  process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org';

const agent = new https.Agent({
  keepAlive: true
});

function parseJSON(res) {
  return bufferStream(res).then(JSON.parse);
}

export function fetchPackageInfo(packageName) {
  return new Promise((accept, reject) => {
    const encodedPackageName =
      packageName.charAt(0) === '@'
        ? `@${encodeURIComponent(packageName.substring(1))}`
        : encodeURIComponent(packageName);

    const infoURL = `${npmRegistryURL}/${encodedPackageName}`;

    debug('Fetching package info for %s from %s', packageName, infoURL);

    const { hostname, pathname } = url.parse(infoURL);
    const options = {
      agent: agent,
      hostname: hostname,
      path: pathname,
      headers: {
        Accept: 'application/json'
      }
    };

    https
      .get(options, async res => {
        if (res.statusCode === 200) {
          accept(parseJSON(res));
        } else if (res.statusCode === 404) {
          accept(null);
        } else {
          const data = await bufferStream(res);
          const content = data.toString('utf-8');
          const error = new Error(
            `Failed to fetch info for ${packageName}\nstatus: ${res.statusCode}\ndata: ${content}`
          );

          reject(error);
        }
      })
      .on('error', reject);
  });
}

export function fetchPackage(packageConfig) {
  return new Promise((accept, reject) => {
    const tarballURL = packageConfig.dist.tarball;

    debug('Fetching package for %s from %s', packageConfig.name, tarballURL);

    const { hostname, pathname } = url.parse(tarballURL);
    const options = {
      agent: agent,
      hostname: hostname,
      path: pathname
    };

    https
      .get(options, async res => {
        if (res.statusCode === 200) {
          accept(res.pipe(gunzip()).pipe(tar.extract()));
        } else {
          const data = await bufferStream(res);
          const spec = `${packageConfig.name}@${packageConfig.version}`;
          const content = data.toString('utf-8');
          const error = new Error(
            `Failed to fetch tarball for ${spec}\nstatus: ${res.statusCode}\ndata: ${content}`
          );

          reject(error);
        }
      })
      .on('error', reject);
  });
}

const oneMegabyte = 1024 * 1024;
const oneSecond = 1000;
const oneMinute = oneSecond * 60;

const cache = new LRUCache({
  max: oneMegabyte * 40,
  length: Buffer.byteLength,
  maxAge: oneSecond
});

const notFound = '';

export async function getPackageInfo(packageName) {
  const key = `npmPackageInfo-${packageName}`;
  const value = cache.get(key);

  if (value != null) {
    return value === notFound ? null : JSON.parse(value);
  }

  const info = await fetchPackageInfo(packageName);

  if (info == null) {
    // Cache 404s for 5 minutes. This prevents us from making
    // unnecessary requests to the registry for bad package names.
    // In the worst case, a brand new package's info will be
    // available within 5 minutes.
    cache.set(key, notFound, oneMinute * 5);
    return null;
  }

  // Cache valid package info for 1 minute. In the worst case,
  // new versions won't be available for 1 minute.
  cache.set(key, JSON.stringify(info), oneMinute);
  return info;
}
