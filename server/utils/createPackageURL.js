function createPackageURL(packageName, version, filename, search) {
  let pathname = `/${packageName}`
  if (version != null) pathname += `@${version}`
  if (filename) pathname += filename
  if (search) pathname += search
  return pathname
}

module.exports = createPackageURL
