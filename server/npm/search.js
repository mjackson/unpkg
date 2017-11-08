const searchIndex = require('./searchIndex')
const getAssetPaths = require('./getAssetPaths')

function enhanceHit(hit) {
  return new Promise(function(resolve, reject) {
    const assetPaths = getAssetPaths(hit.name, hit.version)

    if (assetPaths) {
      // TODO: Double check the package metadata to ensure the files
      // haven't moved from the paths in the index?
      hit.assets = assetPaths.map(function(path) {
        return `https://unpkg.com/${hit.name}@${hit.version}${path}`
      })

      resolve(hit)
    } else {
      // We don't have any global paths for this package yet. Try
      // using the "bare" URL.
      hit.assets = [`https://unpkg.com/${hit.name}@${hit.version}`]

      resolve(hit)
    }
  })
}

// add concatenated name for more relevance for people spelling without spaces
// think: createreactnative instead of create-react-native-app
function concat(string) {
  return string.replace(/[-/@_.]+/g, '')
}

function search(query, page) {
  return new Promise(function(resolve, reject) {
    const hitsPerPage = 10

    const params = {
      // typoTolerance: 'min',
      // optionalFacetFilters: `concatenatedName:${concat(query)}`,
      facets: ['keywords'],
      attributesToHighlight: null,
      attributesToRetrieve: [
        'description',
        'githubRepo',
        'keywords',
        'license',
        'name',
        'owner',
        'version'
      ],
      // restrictSearchableAttributes: [
      //   'name',
      //   'description',
      //   'keywords'
      // ],
      hitsPerPage,
      page
    }

    searchIndex.search(query, params, function(error, value) {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(value.hits.map(enhanceHit)).then(function(hits) {
            const totalHits = value.nbHits
            const totalPages = value.nbPages

            return {
              query,
              page,
              hitsPerPage,
              totalHits,
              totalPages,
              hits
            }
          })
        )
      }
    })
  })
}

module.exports = search
