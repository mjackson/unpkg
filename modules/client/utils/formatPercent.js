export default function formatPercent(n, fixed = 1) {
  return String((n.toPrecision(2) * 100).toFixed(fixed));
}
