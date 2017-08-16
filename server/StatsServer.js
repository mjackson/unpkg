const db = require('./RedisClient')

function sumValues(array) {
  return array.reduce(function (memo, n) {
    return memo + (parseInt(n, 10) || 0)
  }, 0)
}

function getKeyValues(keys) {
  return new Promise(function (resolve, reject) {
    db.mget(keys, function (error, values) {
      if (error) {
        reject(error)
      } else {
        resolve(values)
      }
    })
  })
}

function sumKeys(keys) {
  return getKeyValues(keys).then(sumValues)
}

function createScoresMap(array) {
  const map = {}

  for (let i = 0; i < array.length; i += 2)
    map[array[i]] = parseInt(array[i + 1], 10)

  return map
}

function getScoresMap(key, n = 10) {
  return new Promise(function (resolve, reject) {
    db.zrevrange(key, 0, n, 'withscores', function (error, value) {
      if (error) {
        reject(error)
      } else {
        resolve(createScoresMap(value))
      }
    })
  })
}

function createTopScores(map) {
  return Object.keys(map).reduce(function (memo, key) {
    return memo.concat([ [ key, map[key] ] ])
  }, []).sort(function (a, b) {
    return b[1] - a[1]
  })
}

function getTopScores(key, n) {
  return getScoresMap(key, n).then(createTopScores)
}

function sumMaps(maps) {
  return maps.reduce(function (memo, map) {
    Object.keys(map).forEach(function (key) {
      memo[key] = (memo[key] || 0) + map[key]
    })

    return memo
  }, {})
}

function sumTopScores(keys, n) {
  return Promise.all(
    keys.map(function (key) {
      return getScoresMap(key, n)
    })
  ).then(sumMaps).then(createTopScores)
}

function createKey(...args) {
  return args.join('-')
}

function createDayKey(date) {
  return createKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function createHourKey(date) {
  return createKey(createDayKey(date), date.getUTCHours())
}

function createMinuteKey(date) {
  return createKey(createHourKey(date), date.getUTCMinutes())
}

module.exports = {
  getKeyValues,
  sumKeys,
  getTopScores,
  sumTopScores,
  createDayKey,
  createHourKey,
  createMinuteKey
}
