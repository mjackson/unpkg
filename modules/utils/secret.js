import invariant from 'invariant';

const secretKey = process.env.SECRET_KEY;

invariant(secretKey, 'Missing $SECRET_KEY environment variable');

export const privateKey = secretKey.private;
export const publicKey = secretKey.public;
