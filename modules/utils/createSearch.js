function createSearch(query) {
  const keys = Object.keys(query).sort();
  const params = keys.reduce(
    (memo, key) =>
      memo.concat(
        query[key] === ''
          ? key // Omit the trailing "=" from key=
          : `${key}=${encodeURIComponent(query[key])}`
      ),
    []
  );

  return params.length ? `?${params.join('&')}` : '';
}

module.exports = createSearch;
