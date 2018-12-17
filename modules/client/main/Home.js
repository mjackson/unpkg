require('./Home.css');

const React = require('react');

const h = require('../utils/createHTML');
const markup = require('./Home.md');

function Home() {
  return <div className="wrapper" dangerouslySetInnerHTML={h(markup)} />;
}

module.exports = Home;
