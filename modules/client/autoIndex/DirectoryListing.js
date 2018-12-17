require('./DirectoryListing.css');

const React = require('react');
const formatBytes = require('pretty-bytes');
const sortBy = require('sort-by');

function getDirname(name) {
  return (
    name
      .split('/')
      .slice(0, -1)
      .join('/') || '.'
  );
}

function getMatchingEntries(entry, entries) {
  const dirname = entry.name || '.';

  return Object.keys(entries)
    .filter(name => entry.name !== name && getDirname(name) === dirname)
    .map(name => entries[name]);
}

function getRelativeName(base, name) {
  return base.length ? name.substr(base.length + 1) : name;
}

function DirectoryListing({ filename, entry, entries }) {
  const rows = [];

  if (filename !== '/') {
    rows.push(
      <tr key="..">
        <td>
          <a title="Parent directory" href="../">
            ..
          </a>
        </td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>
    );
  }

  const matchingEntries = getMatchingEntries(entry, entries);

  matchingEntries
    .filter(({ type }) => type === 'directory')
    .sort(sortBy('name'))
    .forEach(({ name }) => {
      const relName = getRelativeName(entry.name, name);
      const href = relName + '/';

      rows.push(
        <tr key={name}>
          <td>
            <a title={relName} href={href}>
              {href}
            </a>
          </td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        </tr>
      );
    });

  matchingEntries
    .filter(({ type }) => type === 'file')
    .sort(sortBy('name'))
    .forEach(({ name, size, contentType, lastModified }) => {
      const relName = getRelativeName(entry.name, name);

      rows.push(
        <tr key={name}>
          <td>
            <a title={relName} href={relName}>
              {relName}
            </a>
          </td>
          <td>{contentType}</td>
          <td>{formatBytes(size)}</td>
          <td>{lastModified}</td>
        </tr>
      );
    });

  return (
    <div className="directory-listing">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Last Modified</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) =>
            React.cloneElement(row, {
              className: index % 2 ? 'odd' : 'even'
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

if (process.env.NODE_ENV === 'development') {
  const PropTypes = require('prop-types');

  const entryType = PropTypes.shape({
    name: PropTypes.string.isRequired
  });

  DirectoryListing.propTypes = {
    filename: PropTypes.string.isRequired,
    entry: entryType.isRequired,
    entries: PropTypes.objectOf(entryType).isRequired
  };
}

module.exports = DirectoryListing;
