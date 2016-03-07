const createRequestHandler = require('npm-http-server').createRequestHandler
const express = require('express')
const cors = require('cors')

const registryURL = process.env.npm_package_config_registryURL
const bowerBundle = process.env.npm_package_config_bowerBundle
const port = process.env.PORT || process.env.npm_package_config_port
const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(express.static('public', { maxAge: 60000 }))
app.use(createRequestHandler(
  registryURL,
  bowerBundle
))

app.listen(port, function () {
  console.log('Server started on port %s, Ctrl+C to quit', port)
})
