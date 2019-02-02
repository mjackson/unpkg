import url from 'url';
import https from 'https';
import gunzip from 'gunzip-maybe';
import LRUCache from 'lru-cache';
import semver from 'semver';
import tar from 'tar-stream';

import debug from './debug';
import bufferStream from './bufferStream';

const npmRegistryURL =
  process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org';

const agent = new https.Agent({
  keepAlive: true
});

const maxMegabytes = 40; // Cap the cache at 40 MB
const maxLength = maxMegabytes * 1024 * 1024;
const oneSecond = 1000;
const oneMinute = 60 * oneSecond;

const cache = new LRUCache({
  max: maxLength,
  maxAge: oneMinute,
  length: Buffer.byteLength
});

function parseJSON(res) {
  return bufferStream(res).then(JSON.parse);
}

export async function fetchPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
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
      .get(options, res => {
        if (res.statusCode === 200) {
          resolve(parseJSON(res));
        } else if (res.statusCode === 404) {
          resolve(null);
        } else {
          bufferStream(res).then(data => {
            const content = data.toString('utf-8');
            const error = new Error(
              `Failed to fetch info for ${packageName}\nstatus: ${
                res.statusCode
              }\ndata: ${content}`
            );

            reject(error);
          });
        }
      })
      .on('error', reject);
  });
}

const notFound = '';

function extractTags(info) {
  return info['dist-tags'];
}

function byVersion(a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}

function extractVersions(info) {
  return Object.keys(info.versions).sort(byVersion);
}

function extractConfig(info, version) {
  const config = info.versions[version];

  if (!config) return null;

  return Object.keys(config).reduce((memo, key) => {
    // Ignore npm private keys and other large keys.
    if (key.charAt(0) !== '_' && key !== 'readme') {
      memo[key] = config[key];
    }

    return memo;
  }, {});
}

export async function getConfig(packageName, version) {
  const key = `config:${packageName}:${version}`;
  const value = cache.get(key);

  if (value != null) {
    return value === notFound ? null : JSON.parse(value);
  }

  const info = await fetchPackageInfo(packageName);

  if (info == null) {
    cache.set(key, notFound, oneMinute * 5);
    return null;
  }

  // Pre-emptively cache tags on each config fetch.
  const tags = extractTags(info);
  if (tags) {
    cache.set(`tags:${packageName}`, JSON.stringify(tags), oneMinute);
  } else {
    cache.set(`tags:${packageName}`, notFound, oneMinute * 5);
  }

  // Pre-emptively cache versions on each config fetch.
  const versions = extractVersions(info);
  if (versions) {
    cache.set(`versions:${packageName}`, JSON.stringify(versions), oneMinute);
  } else {
    cache.set(`versions:${packageName}`, notFound, oneMinute * 5);
  }

  const config = extractConfig(info, version);

  if (config) {
    cache.set(key, JSON.stringify(config), oneMinute * 60);
    return config;
  }

  cache.set(key, notFound, oneMinute * 5);
  return null;
}

export async function getTags(packageName) {
  const key = `tags:${packageName}`;
  const value = cache.get(key);

  if (value != null) {
    return value === notFound ? null : JSON.parse(value);
  }

  const info = await fetchPackageInfo(packageName);

  if (info == null) {
    cache.set(key, notFound, oneMinute * 5);
    return null;
  }

  const tags = extractTags(info);

  if (tags) {
    cache.set(key, JSON.stringify(tags), oneMinute);
    return tags;
  }

  cache.set(key, notFound, oneMinute * 5);
  return null;
}

export async function getVersions(packageName) {
  const key = `versions:${packageName}`;
  const value = cache.get(key);

  if (value != null) {
    return value === notFound ? null : JSON.parse(value);
  }

  const info = await fetchPackageInfo(packageName);

  if (info == null) {
    cache.set(key, notFound, oneMinute * 5);
    return null;
  }

  const versions = extractVersions(info);

  if (versions) {
    cache.set(key, JSON.stringify(versions), oneMinute);
    return versions;
  }

  cache.set(key, notFound, oneMinute * 5);
  return null;
}

export async function fetchPackage(packageConfig) {
  return new Promise((resolve, reject) => {
    const tarballURL = packageConfig.dist.tarball;

    debug('Fetching package for %s from %s', packageConfig.name, tarballURL);

    const { hostname, pathname } = url.parse(tarballURL);
    const options = {
      agent: agent,
      hostname: hostname,
      path: pathname
    };

    https
      .get(options, res => {
        if (res.statusCode === 200) {
          resolve(res.pipe(gunzip()).pipe(tar.extract()));
        } else {
          bufferStream(res).then(data => {
            const spec = `${packageConfig.name}@${packageConfig.version}`;
            const content = data.toString('utf-8');
            const error = new Error(
              `Failed to fetch tarball for ${spec}\nstatus: ${
                res.statusCode
              }\ndata: ${content}`
            );

            reject(error);
          });
        }
      })
      .on('error', reject);
  });
}
