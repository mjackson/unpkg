const createRequestHandler = require('npm-http-server').createRequestHandler
const express = require('express')
const cors = require('cors')

const port = process.env.PORT || process.env.npm_package_config_port
const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(express.static('public', { maxAge: 60000 }))
app.use(createRequestHandler())

app.listen(port, function () {
  console.log('Server started on port ' + port + '. Ctrl+C to quit')
})
