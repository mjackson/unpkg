import path from 'path'

export const id = 1
export const port = parseInt(process.env.PORT, 10) || 5000
export const webpackConfig = require('../../webpack.config')
export const statsFile = path.resolve(__dirname, '../../stats.json')
export const publicDir = path.resolve(__dirname, '../../public')
export const manifestFile = path.resolve(publicDir, '__assets__/chunk-manifest.json')
export const timeout = parseInt(process.env.TIMEOUT, 10) || 20000
export const maxAge = process.env.MAX_AGE || '365d'

export const registryURL = process.env.REGISTRY_URL || 'https://registry.npmjs.org'
export const bowerBundle = process.env.BOWER_BUNDLE || '/bower.zip'
export const redirectTTL = process.env.REDIRECT_TTL || 500
export const autoIndex = !process.env.DISABLE_INDEX
export const redisURL = process.env.REDIS_URL
