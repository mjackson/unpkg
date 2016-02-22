var express = require('express')
var createRequestHandler = require('npm-http-server').createRequestHandler
var cors = require('cors')

var port = process.env.PORT || process.env.npm_package_config_port
var app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(express.static('public', { maxAge: 60000 }))
app.use(createRequestHandler())

app.listen(port, function () {
  console.log('Server started on port ' + port + '. Ctrl+C to quit')
})
