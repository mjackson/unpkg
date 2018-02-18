const formatPercent = (n, fixed = 1) =>
  String((n.toPrecision(2) * 100).toFixed(fixed));

export default formatPercent;
