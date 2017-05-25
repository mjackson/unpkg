const subDays = require('date-fns/sub_days')
const prettyBytes = require('pretty-bytes')
const table = require('text-table')
const {
  sumKeys,
  sumTopScores,
  createDayKey
} = require('../server/StatsServer')

const now = new Date

const createRange = (start, end) => {
  const range = []

  while (start < end)
    range.push(start++)

  return range
}

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
