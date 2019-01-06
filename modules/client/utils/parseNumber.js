export default function parseNumber(s) {
  return parseInt(s.replace(/,/g, ''), 10) || 0;
}
