export default function createSearch(query) {
  const keys = Object.keys(query).sort();
  const pairs = keys.reduce(
    (memo, key) =>
      memo.concat(
        query[key] == null || query[key] === ''
          ? key
          : `${key}=${encodeURIComponent(query[key])}`
      ),
    []
  );

  return pairs.length ? `?${pairs.join('&')}` : '';
}
