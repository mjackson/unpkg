import React from 'react';
import PropTypes from 'prop-types';
import { Global, css } from '@emotion/core';

import DirectoryListing from './DirectoryListing';

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

export default class App extends React.Component {
  static defaultProps = {
    availableVersions: []
  };

  handleChange = event => {
    window.location.href = window.location.href.replace(
      '@' + this.props.packageVersion,
      '@' + event.target.value
    );
  };

  render() {
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
            Index of /{this.props.packageName}@{this.props.packageVersion}
            {this.props.filename}
          </h1>

          <div css={{ float: 'right', lineHeight: '2.25em' }}>
            Version:{' '}
            <select
              id="version"
              defaultValue={this.props.packageVersion}
              onChange={this.handleChange}
              css={{ fontSize: '1em' }}
            >
              {this.props.availableVersions.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </header>

        <hr />

        <DirectoryListing
          filename={this.props.filename}
          entry={this.props.entry}
          entries={this.props.entries}
        />

        <hr />

        <address css={{ textAlign: 'right' }}>
          {this.props.packageName}@{this.props.packageVersion}
        </address>
      </div>
    );
  }
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
