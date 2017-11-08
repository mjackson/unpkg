function createSearch(query) {
  const params = []

  Object.keys(query).forEach(param => {
    if (query[param] === '') {
      params.push(param) // Omit the trailing "=" from param=
    } else {
      params.push(`${param}=${encodeURIComponent(query[param])}`)
    }
  })

  const search = params.join('&')

  return search ? `?${search}` : ''
}

module.exports = createSearch
