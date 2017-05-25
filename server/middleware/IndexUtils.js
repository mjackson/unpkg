const fs = require('fs')
const path = require('path')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const IndexPage = require('./components/IndexPage')
const { getStats } = require('./FileUtils')

const e = React.createElement

const getEntries = (dir) =>
  new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(
            files.map(file => getStats(path.join(dir, file)))
          ).then(
            statsArray => statsArray.map(
              (stats, index) => ({ file: files[index], stats })
            )
          )
        )
      }
    })
  })

const DOCTYPE = '<!DOCTYPE html>'

const generateIndexPage = (props) =>
  DOCTYPE + ReactDOMServer.renderToStaticMarkup(e(IndexPage, props))

const generateDirectoryIndexHTML = (packageInfo, version, baseDir, dir, callback) =>
  getEntries(path.join(baseDir, dir))
    .then(entries => generateIndexPage({ packageInfo, version, dir, entries }))
    .then(html => callback(null, html), callback)

module.exports = {
  generateDirectoryIndexHTML
}
