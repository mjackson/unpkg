import url from 'url';
import https from 'https';
import gunzip from 'gunzip-maybe';
import tar from 'tar-stream';

import bufferStream from './bufferStream';
import agent from './registryAgent';

export default function fetchNpmPackage(packageConfig) {
  return new Promise((resolve, reject) => {
    const tarballURL = packageConfig.dist.tarball;

    console.log(
      'Fetching package for %s from %s',
      packageConfig.name,
      tarballURL
    );

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
