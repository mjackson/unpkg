const redis = require('redis')
const subDays = require('date-fns/sub_days')
const prettyBytes = require('pretty-bytes')
const invariant = require('invariant')
const table = require('text-table')

const RedisURL = process.env.REDIS_URL

invariant(
  RedisURL,
  'Missing the $REDIS_URL environment variable'
)

const sumValues = (array) =>
  array.reduce((memo, n) => memo + (parseInt(n, 10) || 0), 0)

const db = redis.createClient(RedisURL)

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

const createRange = (start, end) => {
  const range = []

  while (start < end)
    range.push(start++)

  return range
}

const createDayKey = (date) =>
  `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`

const createHourKey = (date) =>
  `${createDayKey(date)}-${date.getUTCHours()}`

const now = new Date

const createPastDays = (n) =>
  createRange(1, n + 1).map(days => subDays(now, days)).reverse()

const pastSevenDays = createPastDays(7)
const pastThirtyDays = createPastDays(30)

Promise.all([
  sumKeys(pastSevenDays.map(date => `stats-requests-${createDayKey(date)}`)),
  sumKeys(pastSevenDays.map(date => `stats-bandwidth-${createDayKey(date)}`)),
  sumKeys(pastThirtyDays.map(date => `stats-requests-${createDayKey(date)}`)),
  sumKeys(pastThirtyDays.map(date => `stats-bandwidth-${createDayKey(date)}`))
]).then(results => {
  console.log('\n## Summary')

  console.log(
    'Requests this week: %s',
    results[0].toLocaleString()
  )

  console.log(
    'Bandwidth this week: %s',
    prettyBytes(results[1])
  )

  console.log(
    'Requests this month: %s',
    results[2].toLocaleString()
  )

  console.log(
    'Bandwidth this month: %s',
    prettyBytes(results[3])
  )

  sumTopScores(pastSevenDays.map(date => `stats-packageRequests-${createDayKey(date)}`)).then(results => {
    console.log('\n## Top Packages This Week')

    const topPackages = Object.keys(results).sort((a, b) => results[b] - results[a])

    console.log(
      table(topPackages.map(packageName => [
        packageName,
        results[packageName].toLocaleString()
      ]))
    )

    process.exit()
  })
})
