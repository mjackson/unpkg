function createPackageURL(packageName, version, pathname, search) {
  let url = `/${packageName}`
  if (version != null) url += `@${version}`
  if (pathname) url += pathname
  if (search) url += search
  return url
}

module.exports = createPackageURL
