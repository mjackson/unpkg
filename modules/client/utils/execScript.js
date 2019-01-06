import React from 'react';

import h from './createHTML';

export default function execScript(code) {
  return <script dangerouslySetInnerHTML={h(code)} />;
}
