require('isomorphic-fetch')
const gunzip = require('gunzip-maybe')
const mkdirp = require('mkdirp')
const tar = require('tar-fs')

function normalizeTarHeader(header) {
  // Most packages have header names that look like "package/index.js"
  // so we shorten that to just "index.js" here. A few packages use a
  // prefix other than "package/". e.g. the firebase package uses the
  // "firebase_npm/" prefix. So we just strip the first dir name.
  header.name = header.name.replace(/^[^\/]+\//, '')
  return header
}

function getPackage(tarballURL, outputDir, callback) {
  mkdirp(outputDir, (error) => {
    if (error) {
      callback(error)
    } else {
      let callbackWasCalled = false

      fetch(tarballURL).then(response => {
        response.body
          .pipe(gunzip())
          .pipe(
            tar.extract(outputDir, {
              dmode: 0o666, // All dirs should be writable
              fmode: 0o444, // All files should be readable
              map: normalizeTarHeader
            })
          )
          .on('finish', callback)
          .on('error', (error) => {
            if (callbackWasCalled) // LOL node streams
              return

            callbackWasCalled = true
            callback(error)
          })
      })
    }
  })
}

module.exports = {
  getPackage
}
