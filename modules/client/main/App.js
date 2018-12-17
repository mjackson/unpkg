const React = require('react');
const { HashRouter } = require('react-router-dom');

const Layout = require('./Layout');

function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
}

module.exports = App;
