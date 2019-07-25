import formatBytes from 'pretty-bytes';

export { formatBytes };

export function formatNumber(n) {
  const digits = String(n).split('');
  const groups = [];

  while (digits.length) {
    groups.unshift(digits.splice(-3).join(''));
  }

  return groups.join(',');
}

export function formatPercent(n, decimals = 1) {
  return (n * 100).toPrecision(decimals + 2);
}
