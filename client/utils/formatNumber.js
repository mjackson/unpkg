const formatNumber = (n) => {
  const digits = String(n).split('')
  const groups = []

  while (digits.length)
    groups.unshift(digits.splice(-3).join(''))

  return groups.join(',')
}

export default formatNumber
