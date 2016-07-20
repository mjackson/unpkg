import React, { PropTypes } from 'react'
import formatBytes from 'byte-size'
import formatDate from 'date-fns/format'
import parseDate from 'date-fns/parse'
import { formatNumber, formatPercent } from '../NumberUtils'
import { ContinentsIndex, CountriesIndex, getCountriesByContinent } from '../CountryUtils'
import NumberTextInput from './NumberTextInput'

const getSum = (data, countries) =>
  countries.reduce((n, country) => n + (data[country] || 0), 0)

const addValues = (a, b) => {
  for (const p in b) {
    if (p in a) {
      a[p] += b[p]
    } else {
      a[p] = b[p]
    }
  }
}

class Stats extends React.Component {
  static propTypes = {
    stats: PropTypes.object
  }

  static defaultProps = {
    stats: window.npmcdnStats
  }

  state = {
    minRequests: 5000000
  }

  updateMinRequests = (value) =>
    this.setState({ minRequests: value })
    
  render = () => {
    const { minRequests } = this.state
    const { stats } = this.props
    const { timeseries, totals } = stats

    // Summary data
    const sinceDate = parseDate(totals.since)
    const untilDate = parseDate(totals.until)
    const uniqueVisitors = totals.uniques.all

    const totalRequests = totals.requests.all
    const cachedRequests = totals.requests.cached
    const totalBandwidth = totals.bandwidth.all
    const httpStatus = totals.requests.http_status

    let errorRequests = 0
    for (const status in httpStatus) {
      if (httpStatus.hasOwnProperty(status) && status >= 500)
        errorRequests += httpStatus[status]
    }

    // By Region
    const regionRows = []
    const requestsByCountry = {}
    const bandwidthByCountry = {}

    timeseries.forEach(ts => {
      addValues(requestsByCountry, ts.requests.country)
      addValues(bandwidthByCountry, ts.bandwidth.country)
    })

    const byRequestsDescending = (a, b) =>
      requestsByCountry[b] - requestsByCountry[a]

    const continentData = Object.keys(ContinentsIndex).reduce((memo, continent) => {
      const countries = getCountriesByContinent(continent)

      memo[continent] = {
        countries,
        requests: getSum(requestsByCountry, countries),
        bandwidth: getSum(bandwidthByCountry, countries)
      }

      return memo
    }, {})

    const topContinents = Object.keys(continentData).sort((a, b) => {
      return continentData[b].requests - continentData[a].requests
    })

    topContinents.forEach(continent => {
      const continentName = ContinentsIndex[continent]
      const { countries, requests, bandwidth } = continentData[continent]

      if (bandwidth !== 0) {
        regionRows.push(
          <tr key={continent} className="continent-row">
            <td>{continentName}</td>
            <td>{formatNumber(requests)} ({formatPercent(requests / totalRequests)}%)</td>
            <td>{formatBytes(bandwidth)} ({formatPercent(bandwidth / totalBandwidth)}%)</td>
          </tr>
        )

        const topCountries = countries.sort(byRequestsDescending)

        topCountries.forEach(country => {
          const countryRequests = requestsByCountry[country]
          const countryBandwidth = bandwidthByCountry[country]

          if (countryRequests > minRequests) {
            regionRows.push(
              <tr key={continent + country} className="country-row">
                <td className="country-name">{CountriesIndex[country].name}</td>
                <td>{formatNumber(countryRequests)} ({formatPercent(countryRequests / totalRequests)}%)</td>
                <td>{formatBytes(countryBandwidth)} ({formatPercent(countryBandwidth / totalBandwidth)}%)</td>
              </tr>
            )
          }
        })
      }
    })

    return (
      <div className="wrapper">
        <p>From <strong>{formatDate(sinceDate, 'MMM D')}</strong> to <strong>{formatDate(untilDate, 'MMM D')}</strong>, npmcdn served <strong>{formatNumber(totalRequests)}</strong> requests to <strong>{formatNumber(uniqueVisitors)}</strong> unique visitors, <strong>{formatPercent(cachedRequests / totalRequests, 0)}%</strong> of which came from the cache (CDN). Over the same period, <strong>{formatPercent(errorRequests / totalRequests, 4)}%</strong> of requests resulted in server error (returned an HTTP status &ge; 500).</p>

        <h3>By Region</h3>

        <label className="table-filter">Include countries that made at least <NumberTextInput value={minRequests} onChange={this.updateMinRequests}/> requests.</label>

        <table cellSpacing="0" cellPadding="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Requests (% of total)</th>
              <th>Bandwidth (% of total)</th>
            </tr>
          </thead>
          <tbody>
            {regionRows}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Stats
