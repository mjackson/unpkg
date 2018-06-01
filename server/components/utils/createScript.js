const createElement = require("./createElement");

function createScript(code) {
  return createElement("script", { dangerouslySetInnerHTML: { __html: code } });
}

module.exports = createScript;
