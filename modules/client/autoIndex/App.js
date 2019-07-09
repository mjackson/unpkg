/** @jsx jsx */
import PropTypes from 'prop-types';
import { Global, css, jsx } from '@emotion/core';

import DirectoryListing from './DirectoryListing.js';

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

export default function App({
  packageName,
  packageVersion,
  availableVersions = [],
  filename,
  entry,
  entries
}) {
  function handleChange(event) {
    window.location.href = window.location.href.replace(
      '@' + packageVersion,
      '@' + event.target.value
    );
  }

  return (
    <div css={{ maxWidth: 900, margin: '0 auto' }}>
      <Global styles={globalStyles} />

      <header
        css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <h1>
          Index of /{packageName}@{packageVersion}
          {filename}
        </h1>

        <div css={{ float: 'right', lineHeight: '2.25em' }}>
          Version:{' '}
          <select
            id="version"
            defaultValue={packageVersion}
            onChange={handleChange}
            css={{ fontSize: '1em' }}
          >
            {availableVersions.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </header>

      <hr />

      <DirectoryListing filename={filename} entry={entry} entries={entries} />

      <hr />

      <address css={{ textAlign: 'right' }}>
        {packageName}@{packageVersion}
      </address>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  const entryType = PropTypes.object;

  App.propTypes = {
    packageName: PropTypes.string.isRequired,
    packageVersion: PropTypes.string.isRequired,
    availableVersions: PropTypes.arrayOf(PropTypes.string),
    filename: PropTypes.string.isRequired,
    entry: entryType.isRequired,
    entries: PropTypes.objectOf(entryType).isRequired
  };
}
