const NPMDownloads = require('../NPMDownloads')

function checkMinDailyDownloads(minDailyDownloads) {
  return function (req, res, next) {
    NPMDownloads.getDaily(req.packageName, function (error, downloads) {
      if (error) {
        console.error(error)
        next() // Keep going; this error isn't critical.
      } else if (downloads == null) {
        res.status(404).type('text').send(`Cannot find package "${req.packageName}"`)
      } else if (downloads >= minDailyDownloads) {
        next()
      } else {
        res.status(404).type('text').send(`Cannot serve requests for package "${req.packageName}" because it has been downloaded on average only ${downloads} time${downloads > 1 ? 's' : ''} per day this week`)
      }
    })
  }
}

module.exports = checkMinDailyDownloads
