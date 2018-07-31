require("./autoIndex.css");

const React = require("react");
const ReactDOM = require("react-dom");

const App = require("./autoIndex/App");

const props = window.__DATA__ || {};

ReactDOM.hydrate(<App {...props} />, document.getElementById("root"));
