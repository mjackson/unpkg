import {
  continents as ContinentsIndex,
  countries as CountriesIndex
} from 'countries-list'

const getCountriesByContinent = (continent) =>
  Object.keys(CountriesIndex).filter(country => CountriesIndex[country].continent === continent)

export {
  ContinentsIndex,
  CountriesIndex,
  getCountriesByContinent
}
