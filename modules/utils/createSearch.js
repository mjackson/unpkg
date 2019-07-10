export default function createSearch(query) {
  const keys = Object.keys(query).sort();
  const params = keys.reduce(
    (memo, key) =>
      memo.concat(
        query[key] ? `${key}=${encodeURIComponent(query[key])}` : key
      ),
    []
  );

  return params.length ? `?${params.join('&')}` : '';
}
