function createMutex(doWork) {
  const mutex = {}

  return function (key, callback) {
    if (mutex[key]) {
      mutex[key].push(callback)
    } else {
      mutex[key] = [ function () {
        delete mutex[key]
      }, callback ]

      doWork(key, function (error, value) {
        mutex[key].forEach(function (callback) {
          callback(error, value)
        })
      })
    }
  }
}

module.exports = createMutex
