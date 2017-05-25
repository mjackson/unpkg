const React = require('react')
const semver = require('semver')
const DirectoryListing = require('./DirectoryListing')
const { readCSS } = require('../StyleUtils')

const e = React.createElement

const IndexPageStyle = readCSS(__dirname, 'IndexPage.css')
const IndexPageScript = `
var s = document.getElementById('version'), v = s.value
s.onchange = function () {
  window.location.href = window.location.href.replace('@' + v, '@' + s.value)
}
`

const byVersion = (a, b) =>
  semver.lt(a, b) ? -1 : (semver.gt(a, b) ? 1 : 0)

const IndexPage = ({ packageInfo, version, dir, entries }) => {
  const versions = Object.keys(packageInfo.versions).sort(byVersion)
  const options = versions.map(v => (
    e('option', { key: v, value: v }, `${packageInfo.name}@${v}`)
  ))

  return (
    e('html', null,
      e('head', null,
        e('meta', { charSet: 'utf-8' }),
        e('title', null, `Index of ${dir}`),
        e('style', { dangerouslySetInnerHTML: { __html: IndexPageStyle } })
      ),
      e('body', null,
        e('div', { className: 'version-wrapper' },
          e('select', { id: 'version', defaultValue: version }, options)
        ),
        e('h1', null, `Index of ${dir}`),
        e('script', { dangerouslySetInnerHTML: { __html: IndexPageScript } }),
        e('hr'),
        e(DirectoryListing, { dir, entries }),
        e('hr'),
        e('address', null, `${packageInfo.name}@${version}`)
      )
    )
  )
}

module.exports = IndexPage
