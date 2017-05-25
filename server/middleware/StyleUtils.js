const fs = require('fs')
const path = require('path')
const csso = require('csso')

const minifyCSS = (css) =>
  csso.minify(css).css

const readCSS = (...args) =>
  minifyCSS(fs.readFileSync(path.resolve(...args), 'utf8'))

module.exports = {
  minifyCSS,
  readCSS
}
