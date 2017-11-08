function createMutex(doWork) {
  const mutex = {}

  return function(key, payload, callback) {
    if (mutex[key]) {
      mutex[key].push(callback)
    } else {
      mutex[key] = [
        function() {
          delete mutex[key]
        },
        callback
      ]

      doWork(payload, function(error, value) {
        mutex[key].forEach(callback => {
          callback(error, value)
        })
      })
    }
  }
}

module.exports = createMutex
