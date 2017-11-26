const fs = require("fs")
const path = require("path")
const React = require("react")
const ReactDOMServer = require("react-dom/server")
const getFileStats = require("./getFileStats")
const IndexPage = require("../components/IndexPage")

const e = React.createElement

function getEntries(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, function(error, files) {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(files.map(file => getFileStats(path.join(dir, file)))).then(statsArray => {
            return statsArray.map((stats, index) => {
              return { file: files[index], stats }
            })
          })
        )
      }
    })
  })
}

const DOCTYPE = "<!DOCTYPE html>"

function createHTML(props) {
  return DOCTYPE + ReactDOMServer.renderToStaticMarkup(e(IndexPage, props))
}

function getIndexHTML(packageInfo, version, baseDir, dir) {
  return getEntries(path.join(baseDir, dir)).then(entries =>
    createHTML({ packageInfo, version, dir, entries })
  )
}

module.exports = getIndexHTML
