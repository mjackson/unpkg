const db = require('../../RedisClient')

function incrementCounter(counter, key, by) {
  return new Promise((resolve, reject) => {
    db.hincrby(counter, key, by, (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(value)
      }
    })
  })
}

module.exports = incrementCounter
