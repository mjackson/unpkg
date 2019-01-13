import React from 'react';
import ReactDOM from 'react-dom';
import { Global, css } from '@emotion/core';

import App from './main/App';

const globalStyles = css`
  body {
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    line-height: 1.7;
    padding: 5px 20px;
    color: #000000;
  }

  @media (min-width: 800px) {
    body {
      padding: 40px 20px 120px;
    }
  }

  a:link {
    color: blue;
  }
  a:visited {
    color: rebeccapurple;
  }

  h3 {
    font-size: 1.6em;
  }

  dd,
  ul {
    margin-left: 0;
    padding-left: 25px;
  }
`;

ReactDOM.render(
  <div>
    <Global styles={globalStyles} />
    <App />
  </div>,
  document.getElementById('root')
);
