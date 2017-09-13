const express = require('express')
const getAssetPaths = require('./npm/getAssetPaths')
const npmSearchIndex = require('./npm/searchIndex')

function enhanceHit(hit) {
  return new Promise(function (resolve, reject) {
    const assetPaths = getAssetPaths(hit.name, hit.version)

    if (assetPaths) {
      // TODO: Double check the package metadata to ensure the files
      // haven't moved from the paths in the index?
      hit.assets = assetPaths.map(function (path) {
        return `https://unpkg.com/${hit.name}@${hit.version}${path}`
      })

      resolve(hit)
    } else {
      resolve(hit)
    }
  })
}

function byRelevanceDescending(a, b) {
  // Hits that have assets are more relevant.
  return a.assets ? (b.assets ? 0 : -1) : (b.assets ? 1 : 0)
}

function createSearchServer() {
  const app = express()

  app.get('/', function (req, res) {
    const { query, page = 0 } = req.query
    const hitsPerPage = 20

    if (!query)
      return res.status(403).send({ error: 'Missing ?query parameter' })

    const params = {
      typoTolerance: 'min',
      attributesToRetrieve: [
        'name',
        'version',
        'description',
        'owner'
      ],
      attributesToHighlight: null,
      restrictSearchableAttributes: [
        'name',
        'description'
      ],
      hitsPerPage,
      page
    }

    npmSearchIndex.search(query, params, function (error, value) {
      if (error) {
        console.error(error)
        res.status(500).send({ error: 'There was an error executing the search' })
      } else {
        Promise.all(
          value.hits.map(enhanceHit)
        ).then(function (hits) {
          hits.sort(byRelevanceDescending)

          const totalHits = value.nbHits
          const totalPages = value.nbPages

          res.send({
            query,
            page,
            hitsPerPage,
            totalHits,
            totalPages,
            hits
          })
        }, function (error) {
          console.error(error)
          res.status(500).send({ error: 'There was an error executing the search' })
        })
      }
    })
  })

  return app
}

module.exports = createSearchServer
