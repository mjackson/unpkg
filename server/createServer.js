const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")

const checkBlacklist = require("./middleware/checkBlacklist")
const fetchFile = require("./middleware/fetchFile")
const parseURL = require("./middleware/parseURL")
const requireAuth = require("./middleware/requireAuth")
const serveFile = require("./middleware/serveFile")
const userToken = require("./middleware/userToken")
const validatePackageURL = require("./middleware/validatePackageURL")

morgan.token("fwd", function(req) {
  return req.get("x-forwarded-for").replace(/\s/g, "")
})

function errorHandler(err, req, res, next) {
  console.error(err.stack)

  res
    .status(500)
    .type("text")
    .send("Internal Server Error")

  next(err)
}

function createRouter(setup) {
  const app = express.Router()
  setup(app)
  return app
}

function createServer() {
  const app = express()

  app.disable("x-powered-by")

  if (process.env.NODE_ENV !== "test") {
    app.use(
      morgan(
        process.env.NODE_ENV === "production"
          ? // Modified version of the Heroku router's log format
            // https://devcenter.heroku.com/articles/http-routing#heroku-router-log-format
            'method=:method path=":url" host=:req[host] request_id=:req[x-request-id] cf_ray=:req[cf-ray] fwd=:fwd status=:status bytes=:res[content-length]'
          : "dev"
      )
    )
  }

  app.use(errorHandler)

  app.use(
    express.static("build", {
      maxAge: "365d"
    })
  )

  app.use(cors())
  app.use(bodyParser.json())
  app.use(userToken)

  app.get("/_publicKey", require("./actions/showPublicKey"))

  app.use(
    "/_auth",
    createRouter(app => {
      app.post("/", require("./actions/createAuth"))
      app.get("/", require("./actions/showAuth"))
    })
  )

  app.use(
    "/_blacklist",
    createRouter(app => {
      app.post("/", requireAuth("blacklist.add"), require("./actions/addToBlacklist"))
      app.get("/", requireAuth("blacklist.read"), require("./actions/showBlacklist"))
      app.delete(
        /.*/,
        requireAuth("blacklist.remove"),
        validatePackageURL,
        require("./actions/removeFromBlacklist")
      )
    })
  )

  if (process.env.NODE_ENV !== "test") {
    app.get("/_stats", require("./actions/showStats"))
  }

  app.use("/", parseURL, checkBlacklist, fetchFile, serveFile)

  return app
}

module.exports = createServer
