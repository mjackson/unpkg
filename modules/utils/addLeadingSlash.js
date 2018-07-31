function addLeadingSlash(name) {
  return name.charAt(0) === "/" ? name : "/" + name;
}

module.exports = addLeadingSlash;
