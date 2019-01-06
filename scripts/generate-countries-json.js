const countriesList = require('countries-list');

const json = JSON.stringify({
  continents: countriesList.continents,
  countries: Object.keys(countriesList.countries).reduce((memo, key) => {
    const { name, continent } = countriesList.countries[key];
    memo[key] = { name, continent };
    return memo;
  }, {})
});

console.log(json);
