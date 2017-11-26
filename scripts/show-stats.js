const subDays = require("date-fns/sub_days")
const prettyBytes = require("pretty-bytes")
const table = require("text-table")

const StatsAPI = require("../server/StatsAPI")
const now = new Date()

function createRange(start, end) {
  const range = []
  while (start < end) range.push(start++)
  return range
}

function createPastDays(n) {
  return createRange(1, n + 1)
    .map(days => subDays(now, days))
    .reverse()
}

const pastSevenDays = createPastDays(7)
const pastThirtyDays = createPastDays(30)

Promise.all([
  StatsAPI.sumKeys(pastSevenDays.map(date => `stats-requests-${StatsAPI.createDayKey(date)}`)),
  StatsAPI.sumKeys(pastSevenDays.map(date => `stats-bandwidth-${StatsAPI.createDayKey(date)}`)),
  StatsAPI.sumKeys(pastThirtyDays.map(date => `stats-requests-${StatsAPI.createDayKey(date)}`)),
  StatsAPI.sumKeys(pastThirtyDays.map(date => `stats-bandwidth-${StatsAPI.createDayKey(date)}`))
]).then(results => {
  console.log("\n## Summary")
  console.log("Requests this week: %s", results[0].toLocaleString())
  console.log("Bandwidth this week: %s", prettyBytes(results[1]))
  console.log("Requests this month: %s", results[2].toLocaleString())
  console.log("Bandwidth this month: %s", prettyBytes(results[3]))

  StatsAPI.sumTopScores(
    pastSevenDays.map(date => `stats-packageRequests-${StatsAPI.createDayKey(date)}`)
  ).then(topPackages => {
    console.log("\n## Top Packages This Week")

    topPackages.forEach(result => {
      result[1] = result[1].toLocaleString()
    })

    console.log(table(topPackages))

    process.exit()
  })
})
