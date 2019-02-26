export default function formatPercent(n, decimals = 1) {
  return (n * 100).toPrecision(decimals + 2);
}
