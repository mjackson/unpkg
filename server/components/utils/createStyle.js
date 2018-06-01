const createElement = require("./createElement");

function createStyle(code) {
  return createElement("style", { dangerouslySetInnerHTML: { __html: code } });
}

module.exports = createStyle;
