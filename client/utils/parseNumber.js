const parseNumber = s => parseInt(s.replace(/,/g, ''), 10) || 0

export default parseNumber
