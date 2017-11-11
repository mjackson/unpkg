const AuthAPI = require('../AuthAPI')

const DefaultScopes = {
  blacklist: {
    read: true
  }
}

function createAuth(req, res) {
  AuthAPI.createToken(DefaultScopes).then(
    token => {
      res.send({ token })
    },
    error => {
      console.error(error)

      res.status(500).send({
        error: 'Unable to generate auth token'
      })
    }
  )
}

module.exports = createAuth
