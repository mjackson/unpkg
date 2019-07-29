/** @jsx jsx */
import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import VisuallyHidden from '@reach/visually-hidden';
import sortBy from 'sort-by';

import { formatBytes } from '../utils/format.js';

import { DirectoryIcon, CodeFileIcon } from './Icons.js';

const linkStyle = {
  color: '#0076ff',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
};

const tableCellStyle = {
  paddingTop: 6,
  paddingRight: 3,
  paddingBottom: 6,
  paddingLeft: 3,
  borderTop: '1px solid #eaecef'
};

const iconCellStyle = {
  ...tableCellStyle,
  color: '#424242',
  width: 17,
  paddingRight: 2,
  paddingLeft: 10,
  '@media (max-width: 700px)': {
    paddingLeft: 20
  }
};

const typeCellStyle = {
  ...tableCellStyle,
  textAlign: 'right',
  paddingRight: 10,
  '@media (max-width: 700px)': {
    paddingRight: 20
  }
};

function getRelName(path, base) {
  return path.substr(base.length > 1 ? base.length + 1 : 1);
}

export default function DirectoryViewer({ path, details: entries }) {
  const rows = [];

  if (path !== '/') {
    rows.push(
      <tr key="..">
        <td css={iconCellStyle} />
        <td css={tableCellStyle}>
          <a title="Parent directory" href="../" css={linkStyle}>
            ..
          </a>
        </td>
        <td css={tableCellStyle}></td>
        <td css={typeCellStyle}></td>
      </tr>
    );
  }

  const { subdirs, files } = Object.keys(entries).reduce(
    (memo, key) => {
      const { subdirs, files } = memo;
      const entry = entries[key];

      if (entry.type === 'directory') {
        subdirs.push(entry);
      } else if (entry.type === 'file') {
        files.push(entry);
      }

      return memo;
    },
    { subdirs: [], files: [] }
  );

  subdirs.sort(sortBy('path')).forEach(({ path: dirname }) => {
    const relName = getRelName(dirname, path);
    const href = relName + '/';

    rows.push(
      <tr key={relName}>
        <td css={iconCellStyle}>
          <DirectoryIcon />
        </td>
        <td css={tableCellStyle}>
          <a title={relName} href={href} css={linkStyle}>
            {relName}
          </a>
        </td>
        <td css={tableCellStyle}>-</td>
        <td css={typeCellStyle}>-</td>
      </tr>
    );
  });

  files
    .sort(sortBy('path'))
    .forEach(({ path: filename, size, contentType }) => {
      const relName = getRelName(filename, path);
      const href = relName;

      rows.push(
        <tr key={relName}>
          <td css={iconCellStyle}>
            <CodeFileIcon />
          </td>
          <td css={tableCellStyle}>
            <a title={relName} href={href} css={linkStyle}>
              {relName}
            </a>
          </td>
          <td css={tableCellStyle}>{formatBytes(size)}</td>
          <td css={typeCellStyle}>{contentType}</td>
        </tr>
      );
    });

  return (
    <div
      css={{
        border: '1px solid #dfe2e5',
        borderRadius: 3,
        borderTopWidth: 0,
        '@media (max-width: 700px)': {
          borderRightWidth: 0,
          borderLeftWidth: 0
        }
      }}
    >
      <table
        css={{
          width: '100%',
          borderCollapse: 'collapse',
          borderRadius: 2,
          background: '#fff',
          '@media (max-width: 700px)': {
            '& th + th + th + th, & td + td + td + td': {
              display: 'none'
            }
          }
        }}
      >
        <thead>
          <tr>
            <th>
              <VisuallyHidden>Icon</VisuallyHidden>
            </th>
            <th>
              <VisuallyHidden>Name</VisuallyHidden>
            </th>
            <th>
              <VisuallyHidden>Size</VisuallyHidden>
            </th>
            <th>
              <VisuallyHidden>Content Type</VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  DirectoryViewer.propTypes = {
    path: PropTypes.string.isRequired,
    details: PropTypes.objectOf(
      PropTypes.shape({
        path: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['directory', 'file']).isRequired,
        contentType: PropTypes.string, // file only
        integrity: PropTypes.string, // file only
        size: PropTypes.number // file only
      })
    ).isRequired
  };
}
