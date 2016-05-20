export const formatNumber = (n) => {
  const digits = String(n).split('')
  const groups = []

  while (digits.length)
    groups.unshift(digits.splice(-3).join(''))

  return groups.join(',')
}

export const parseNumber = (s) =>
  parseInt(s.replace(/,/g, ''), 10)

export const formatPercent = (n, fixed = 1) =>
  String((n.toPrecision(2) * 100).toFixed(fixed))
