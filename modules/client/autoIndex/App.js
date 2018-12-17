require('./App.css');

const React = require('react');

const DirectoryListing = require('./DirectoryListing');

class App extends React.Component {
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
      <div className="app">
        <header className="app-header">
          <h1>
            Index of /{this.props.packageName}@{this.props.packageVersion}
            {this.props.filename}
          </h1>

          <div className="app-version-selector">
            Version:{' '}
            <select
              id="version"
              defaultValue={this.props.packageVersion}
              onChange={this.handleChange}
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

        <address className="app-address">
          {this.props.packageName}@{this.props.packageVersion}
        </address>
      </div>
    );
  }
}

if (process.env.NODE_ENV === 'development') {
  const PropTypes = require('prop-types');

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

module.exports = App;
