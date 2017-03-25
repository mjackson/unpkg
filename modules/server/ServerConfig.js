const path = require('path')

exports.id = 1
exports.port = parseInt(process.env.PORT, 10) || 5000
exports.webpackConfig = require('../../webpack.config')
exports.statsFile = path.resolve(__dirname, '../../stats.json')
exports.publicDir = path.resolve(__dirname, '../../public')
exports.manifestFile = path.resolve(exports.publicDir, '__assets__/chunk-manifest.json')
exports.timeout = parseInt(process.env.TIMEOUT, 10) || 20000
exports.maxAge = process.env.MAX_AGE || '365d'

exports.registryURL = process.env.REGISTRY_URL || 'https://registry.npmjs.org'
exports.bowerBundle = process.env.BOWER_BUNDLE || '/bower.zip'
exports.redirectTTL = process.env.REDIRECT_TTL || 500
exports.autoIndex = !process.env.DISABLE_INDEX
exports.redisURL = process.env.REDIS_URL

exports.blacklist = require('../PackageBlacklist')
