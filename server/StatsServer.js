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

const getTopScores = (key, n = 10) =>
  new Promise((resolve, reject) => {
    db.zrevrange(key, 0, n, 'withscores', (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(createScoresMap(value))
      }
    })
  })

const sumTopScores = (keys, n) =>
  Promise.all(keys.map(key => getTopScores(key, n))).then(values => {
    return values.reduce((memo, map) => {
      Object.keys(map).forEach(key => {
        memo[key] = (memo[key] || 0) + map[key]
      })

      return memo
    }, {})
  })

const createDayKey = (date) =>
  `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`

const createHourKey = (date) =>
  `${createDayKey(date)}-${date.getUTCHours()}`

const createMinuteKey = (date) =>
  `${createDayKey(date)}-${date.getUTCMinutes()}`

module.exports = {
  getKeyValues,
  sumKeys,
  getTopScores,
  sumTopScores,
  createDayKey,
  createHourKey,
  createMinuteKey
}
