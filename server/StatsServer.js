const redis = require('redis')
const invariant = require('invariant')

const RedisURL = process.env.REDIS_URL

invariant(
  RedisURL,
  'Missing the $REDIS_URL environment variable'
)

const db = redis.createClient(RedisURL)

const sumValues = (array) =>
  array.reduce((memo, n) => memo + (parseInt(n, 10) || 0), 0)

const getKeyValues = (keys) =>
  new Promise((resolve, reject) => {
    db.mget(keys, (error, values) => {
      if (error) {
        reject(error)
      } else {
        resolve(values)
      }
    })
  })

const sumKeys = (keys) =>
  getKeyValues(keys).then(sumValues)

const createScoresMap = (array) => {
  const map = {}

  for (let i = 0; i < array.length; i += 2)
    map[array[i]] = parseInt(array[i + 1], 10)

  return map
}

const getScoresMap = (key, n = 10) =>
  new Promise((resolve, reject) => {
    db.zrevrange(key, 0, n, 'withscores', (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(createScoresMap(value))
      }
    })
  })

const createTopScores = (map) =>
  Object.keys(map)
    .reduce((memo, key) => memo.concat([ [ key, map[key] ] ]), [])
    .sort((a, b) => b[1] - a[1])

const getTopScores = (key, n) =>
  getScoresMap(key, n).then(createTopScores)

const sumMaps = (maps) =>
  maps.reduce((memo, map) => {
    Object.keys(map).forEach(key => {
      memo[key] = (memo[key] || 0) + map[key]
    })

    return memo
  }, {})

const sumTopScores = (keys, n) =>
  Promise.all(keys.map(key => getScoresMap(key, n)))
    .then(sumMaps)
    .then(createTopScores)


      return memo
    }, {})
  })

const createKey = (...args) => args.join('-')

const createDayKey = (date) =>
  createKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

const createHourKey = (date) =>
  createKey(createDayKey(date), date.getUTCHours())

const createMinuteKey = (date) =>
  createKey(createHourKey(date), date.getUTCMinutes())

module.exports = {
  getKeyValues,
  sumKeys,
  getTopScores,
  sumTopScores,
  createDayKey,
  createHourKey,
  createMinuteKey
}
