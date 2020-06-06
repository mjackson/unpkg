/** @jsx jsx */
import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import VisuallyHidden from '@reach/visually-hidden';
import sortBy from 'sort-by';

import { formatBytes } from '../utils/format.js';

import { ContentArea, ContentAreaHeaderBar } from './ContentArea.js';
import { FolderIcon, FileIcon, FileCodeIcon } from './Icons.js';

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

export default function FolderViewer({ path, details: entries }) {
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

  subdirs.sort(sortBy('path'));
  files.sort(sortBy('path'));

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

  subdirs.forEach(({ path: dirname }) => {
    const relName = getRelName(dirname, path);
    const href = relName + '/';

    rows.push(
      <tr key={relName}>
        <td css={iconCellStyle}>
          <FolderIcon />
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

  files.forEach(({ path: filename, size, contentType }) => {
    const relName = getRelName(filename, path);
    const href = relName;

    rows.push(
      <tr key={relName}>
        <td css={iconCellStyle}>
          {contentType === 'text/plain' || contentType === 'text/markdown' ? (
            <FileIcon />
          ) : (
            <FileCodeIcon />
          )}
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

  let counts = [];
  if (files.length > 0) {
    counts.push(`${files.length} file${files.length === 1 ? '' : 's'}`);
  }
  if (subdirs.length > 0) {
    counts.push(`${subdirs.length} folder${subdirs.length === 1 ? '' : 's'}`);
  }

  return (
    <ContentArea>
      <ContentAreaHeaderBar>
        <span>{counts.join(', ')}</span>
      </ContentAreaHeaderBar>

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
          },
          '& tr:first-of-type td': {
            borderTop: 0
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
    </ContentArea>
  );
}

if (process.env.NODE_ENV !== 'production') {
  FolderViewer.propTypes = {
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
