import React from 'react';
import PropTypes from 'prop-types';

import DirectoryListing from './DirectoryListing';

const styles = {
  wrapper: {
    maxWidth: 900,
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  versionSelector: {
    float: 'right',
    lineHeight: '2.25em'
  },
  versionDropdown: {
    fontSize: '1em'
  },
  address: {
    textAlign: 'right'
  }
};

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
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <h1>
            Index of /{this.props.packageName}@{this.props.packageVersion}
            {this.props.filename}
          </h1>

          <div style={styles.versionSelector}>
            Version:{' '}
            <select
              id="version"
              defaultValue={this.props.packageVersion}
              onChange={this.handleChange}
              style={styles.versionDropdown}
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

        <address style={styles.address}>
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
