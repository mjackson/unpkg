import invariant from 'invariant';

export const npmRegistryURL =
  process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org';

export const origin = process.env.ORIGIN || 'https://unpkg.com';

export const secretKey = process.env.SECRET_KEY;

invariant(secretKey, 'Missing $SECRET_KEY environment variable');
