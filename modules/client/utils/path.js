export function join(...paths) {
  return (
    paths
      .join('/')
      .replace(/\/+/g, '/')
      .replace(/\/$/, '') || '.'
  );
}

export function basename(path) {
  return path.split('/').slice(-1);
}

export function dirname(path) {
  return (
    path
      .replace(/\/$/, '')
      .split('/')
      .slice(0, -1)
      .join('/') || '.'
  );
}
