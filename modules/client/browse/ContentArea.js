/** @jsx jsx */
import { jsx } from '@emotion/core';

const maxWidth = 700;

export function ContentArea({ children, css }) {
  return (
    <div
      css={{
        border: '1px solid #dfe2e5',
        borderRadius: 3,
        [`@media (max-width: ${maxWidth}px)`]: {
          borderRightWidth: 0,
          borderLeftWidth: 0
        },
        ...css
      }}
    >
      {children}
    </div>
  );
}

export function ContentAreaHeaderBar({ children, css }) {
  return (
    <div
      css={{
        padding: 10,
        background: '#f6f8fa',
        color: '#424242',
        border: '1px solid #d1d5da',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        margin: '-1px -1px 0',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        [`@media (max-width: ${maxWidth}px)`]: {
          paddingRight: 20,
          paddingLeft: 20
        },
        ...css
      }}
    >
      {children}
    </div>
  );
}
