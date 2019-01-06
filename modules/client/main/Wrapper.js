import React from 'react';

export default function Wrapper({ children }) {
  return <div style={{ maxWidth: 700, margin: '0 auto' }}>{children}</div>;
}
