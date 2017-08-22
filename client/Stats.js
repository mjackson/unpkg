import React from 'react'
import PropTypes from 'prop-types'
import formatBytes from 'pretty-bytes'
import formatDate from 'date-fns/format'
import parseDate from 'date-fns/parse'
import formatNumber from './utils/formatNumber'
import formatPercent from './utils/formatPercent'

import { continents, countries } from 'countries-list'

const getCountriesByContinent = (continent) =>
  Object.keys(countries).filter(country => countries[country].continent === continent)

const sumKeyValues = (hash, keys) =>
  keys.reduce((n, key) => n + (hash[key] || 0), 0)

const sumValues = (hash) =>
  Object.keys(hash).reduce((memo, key) => memo + hash[key], 0)

class Stats extends React.Component {
  static propTypes = {
    data: PropTypes.object
  }

  state = {
    minPackageRequests: 100000,
    minCountryRequests: 1000000
  }

  render() {
    const { data } = this.props

    if (data == null)
      return null

    const totals = data.totals

    // Summary data
    const since = parseDate(totals.since)
    const until = parseDate(totals.until)

    // Packages
    const packageRows = []

    Object.keys(totals.requests.package).sort((a, b) => {
      return totals.requests.package[b] - totals.requests.package[a]
    }).forEach(packageName => {
      const requests = totals.requests.package[packageName]
      const bandwidth = totals.bandwidth.package[packageName]

      if (requests >= this.state.minPackageRequests) {
        packageRows.push(
          <tr key={packageName}>
            <td><a href={`https://npmjs.org/package/${packageName}`} title={`${packageName} on npm`}>{packageName}</a></td>
            <td>{formatNumber(requests)} ({formatPercent(requests / totals.requests.all)}%)</td>
            {bandwidth
              ? <td>{formatBytes(bandwidth)} ({formatPercent(bandwidth / totals.bandwidth.all)}%)</td>
              : <td>-</td>
            }
          </tr>
        )
      }
    })

    // Protocols
    const protocolRows = Object.keys(totals.requests.protocol).sort((a, b) => {
      return totals.requests.protocol[b] - totals.requests.protocol[a]
    }).map(protocol => {
      const requests = totals.requests.protocol[protocol]

      return (
        <tr key={protocol}>
          <td>{protocol}</td>
          <td>{formatNumber(requests)} ({formatPercent(requests / sumValues(totals.requests.protocol))}%)</td>
        </tr>
      )
    })

    // Regions
    const regionRows = []

    const continentsData = Object.keys(continents).reduce((memo, continent) => {
      const localCountries = getCountriesByContinent(continent)

      memo[continent] = {
        countries: localCountries,
        requests: sumKeyValues(totals.requests.country, localCountries),
        bandwidth: sumKeyValues(totals.bandwidth.country, localCountries)
      }

      return memo
    }, {})

    const topContinents = Object.keys(continentsData).sort((a, b) => {
      return continentsData[b].requests - continentsData[a].requests
    })

    topContinents.forEach(continent => {
      const continentName = continents[continent]
      const continentData = continentsData[continent]

      if (continentData.requests > this.state.minCountryRequests && continentData.bandwidth !== 0) {
        regionRows.push(
          <tr key={continent} className="continent-row">
            <td>{continentName}</td>
            <td>{formatNumber(continentData.requests)} ({formatPercent(continentData.requests / totals.requests.all)}%)</td>
            <td>{formatBytes(continentData.bandwidth)} ({formatPercent(continentData.bandwidth / totals.bandwidth.all)}%)</td>
          </tr>
        )

        const topCountries = continentData.countries.sort((a, b) => {
          return totals.requests.country[b] - totals.requests.country[a]
        })

        topCountries.forEach(country => {
          const countryRequests = totals.requests.country[country]
          const countryBandwidth = totals.bandwidth.country[country]

          if (countryRequests > this.state.minCountryRequests) {
            regionRows.push(
              <tr key={continent + country} className="country-row">
                <td className="country-name">{countries[country].name}</td>
                <td>{formatNumber(countryRequests)} ({formatPercent(countryRequests / totals.requests.all)}%)</td>
                <td>{formatBytes(countryBandwidth)} ({formatPercent(countryBandwidth / totals.bandwidth.all)}%)</td>
              </tr>
            )
          }
        })
      }
    })

    return (
      <div className="wrapper">
        <p>From <strong>{formatDate(since, 'MMM D')}</strong> to <strong>{formatDate(until, 'MMM D')}</strong> unpkg served <strong>{formatNumber(totals.requests.all)}</strong> requests and a total of <strong>{formatBytes(totals.bandwidth.all)}</strong> of data to <strong>{formatNumber(totals.uniques.all)}</strong> unique visitors, <strong>{formatPercent(totals.requests.cached / totals.requests.all, 0)}%</strong> of which were served from the cache.</p>

        <h3>Packages</h3>

        <p className="table-filter">Include only packages that received at least <select
            value={this.state.minPackageRequests}
            onChange={event => this.setState({ minPackageRequests: parseInt(event.target.value, 10) })}
          >
            <option value="0">0</option>
            <option value="1000">1,000</option>
            <option value="10000">10,000</option>
            <option value="100000">100,000</option>
            <option value="1000000">1,000,000</option>
          </select> requests.
        </p>

        <table cellSpacing="0" cellPadding="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Package</th>
              <th>Requests (% of total)</th>
              <th>Bandwidth (% of total)</th>
            </tr>
          </thead>
          <tbody>
            {packageRows}
          </tbody>
        </table>

        <h3>Protocols</h3>

        <table cellSpacing="0" cellPadding="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Protocol</th>
              <th>Requests (% of total)</th>
            </tr>
          </thead>
          <tbody>
            {protocolRows}
          </tbody>
        </table>

        <h3>Regions</h3>

        <p className="table-filter">Include only countries that made at least <select
            value={this.state.minCountryRequests}
            onChange={event => this.setState({ minCountryRequests: parseInt(event.target.value, 10) })}
          >
            <option value="0">0</option>
            <option value="100000">100,000</option>
            <option value="1000000">1,000,000</option>
            <option value="10000000">10,000,000</option>
            <option value="100000000">100,000,000</option>
          </select> requests.
        </p>

        <table cellSpacing="0" cellPadding="0" style={{ width: '100%' }} className="regions-table">
          <thead>
            <tr>
              <th>Region</th>
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
