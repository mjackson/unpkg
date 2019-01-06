import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import data from './data';
import { secretKey } from '../config';

function getCurrentSeconds() {
  return Math.floor(Date.now() / 1000);
}

function createTokenId() {
  return crypto.randomBytes(16).toString('hex');
}

export function createToken(scopes = {}) {
  return new Promise((resolve, reject) => {
    const payload = {
      jti: createTokenId(),
      iss: 'https://unpkg.com',
      iat: getCurrentSeconds(),
      scopes
    };

    jwt.sign(
      payload,
      secretKey.private,
      { algorithm: 'RS256' },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
}

const revokedTokensSet = 'revoked-tokens';

export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    const options = { algorithms: ['RS256'] };

    jwt.verify(token, secretKey.public, options, (error, payload) => {
      if (error) {
        reject(error);
      } else {
        if (payload.jti) {
          data.sismember(revokedTokensSet, payload.jti, (error, value) => {
            if (error) {
              reject(error);
            } else {
              resolve(value === 0 ? payload : null);
            }
          });
        } else {
          resolve(null);
        }
      }
    });
  });
}

export function revokeToken(token) {
  return verifyToken(token).then(payload => {
    if (payload) {
      return new Promise((resolve, reject) => {
        data.sadd(revokedTokensSet, payload.jti, error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  });
}

export function removeAllRevokedTokens() {
  return new Promise((resolve, reject) => {
    data.del(revokedTokensSet, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
