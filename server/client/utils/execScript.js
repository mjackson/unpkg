const React = require("react");

const h = require("./createHTML");

function execScript(code) {
  return <script dangerouslySetInnerHTML={h(code)} />;
}

module.exports = execScript;
