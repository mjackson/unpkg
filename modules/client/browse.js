import React from 'react';
import ReactDOM from 'react-dom';

import App from './browse/App.js';

const props = window.__DATA__ || {};

ReactDOM.hydrate(<App {...props} />, document.getElementById('root'));
