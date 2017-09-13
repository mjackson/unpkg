const algolia = require('algoliasearch')
const invariant = require('invariant')

const AlgoliaNpmSearchAppId = process.env.ALGOLIA_NPM_SEARCH_APP_ID
const AlgoliaNpmSearchApiKey = process.env.ALGOLIA_NPM_SEARCH_API_KEY

invariant(
  AlgoliaNpmSearchAppId,
  'Missing $ALGOLIA_NPM_SEARCH_APP_ID environment variable'
)

invariant(
  AlgoliaNpmSearchApiKey,
  'Missing $ALGOLIA_NPM_SEARCH_API_KEY environment variable'
)

const index = algolia(
  AlgoliaNpmSearchAppId,
  AlgoliaNpmSearchApiKey
).initIndex('npm-search')

module.exports = index
