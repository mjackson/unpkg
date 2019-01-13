import React from 'react';
import ReactDOM from 'react-dom';
import { Global, css } from '@emotion/core';

import App from './autoIndex/App';

const globalStyles = css`
  body {
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    line-height: 1.7;
    padding: 0px 10px 5px;
    color: #000000;
  }
`;

const props = window.__DATA__ || {};

ReactDOM.hydrate(
  <div>
    <Global styles={globalStyles} />
    <App {...props} />
  </div>,
  document.getElementById('root')
);
