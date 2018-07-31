require("./About.css");

const React = require("react");

const h = require("../utils/createHTML");
const markup = require("./About.md");

function About() {
  return <div className="wrapper" dangerouslySetInnerHTML={h(markup)} />;
}

module.exports = About;
