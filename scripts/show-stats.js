const redis = require('redis')
const subDays = require('date-fns/sub_days')
const prettyBytes = require('pretty-bytes')
const invariant = require('invariant')

const RedisURL = process.env.REDIS_URL

invariant(
  RedisURL,
  'Missing the $REDIS_URL environment variable'
)

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

const sumKeys = (keys) => getKeyValues(keys).then(sumValues)

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

const sumValues = (array) =>
  array.reduce((memo, n) => memo + (parseInt(n, 10) || 0), 0)

const now = new Date

const createPastDays = (n) =>
  createRange(1, n + 1).map(days => subDays(now, days)).reverse()

const pastSevenDays = createPastDays(7)
const pastThirtyDays = createPastDays(30)

sumKeys(
  pastSevenDays.map(date => `stats-requests-${createHourKey(date)}`)
).then(total => {
  console.log(
    'Requests this week: %s',
    total.toLocaleString()
  )
})

sumKeys(
  pastSevenDays.map(date => `stats-bandwidth-${createHourKey(date)}`)
).then(total => {
  console.log(
    'Bandwidth this week: %s',
    prettyBytes(total)
  )
})

sumKeys(
  pastThirtyDays.map(date => `stats-requests-${createDayKey(date)}`)
).then(total => {
  console.log(
    'Requests this month: %s',
    total.toLocaleString()
  )
})

sumKeys(
  pastThirtyDays.map(date => `stats-bandwidth-${createDayKey(date)}`)
).then(total => {
  console.log(
    'Bandwidth this month: %s',
    prettyBytes(total)
  )
})
