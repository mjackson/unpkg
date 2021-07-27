export default function createSearch(query) {
  const keys = Object.keys(query).sort();
  const pairs = keys.reduce(
    (memo, key) => {
      const queryParts = Array.isArray(query[key]) ? query[key] : [query[key]];
      return memo.concat(
        ...queryParts.map(part => part == null || part === ''
          ? key
          : `${key}=${encodeURIComponent(part)}`)
      );
    },
    []
  );

  return pairs.length ? `?${pairs.join('&')}` : '';
}
