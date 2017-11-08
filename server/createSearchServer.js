const express = require('express')
const npmSearch = require('./npm/search')

function createSearchServer() {
  const app = express()

  app.get('/', function(req, res) {
    const { query, page = 0 } = req.query

    if (!query)
      return res.status(403).send({ error: 'Missing ?query parameter' })

    npmSearch(query, page).then(
      function(result) {
        res.send(result)
      },
      function(error) {
        console.error(error)
        res
          .status(500)
          .send({ error: 'There was an error executing the search' })
      }
    )
  })

  return app
}

module.exports = createSearchServer
