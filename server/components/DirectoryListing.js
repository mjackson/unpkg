const React = require("react");
const prettyBytes = require("pretty-bytes");
const getFileContentType = require("../utils/getFileContentType");

const e = React.createElement;

const formatTime = time => new Date(time).toISOString();

function DirectoryListing({ dir, entries }) {
  const rows = entries.map(({ file, stats }, index) => {
    const isDir = stats.isDirectory();
    const href = file + (isDir ? "/" : "");

    return e(
      "tr",
      { key: file, className: index % 2 ? "odd" : "even" },
      e("td", null, e("a", { title: file, href }, file)),
      e("td", null, isDir ? "-" : getFileContentType(file)),
      e("td", null, isDir ? "-" : prettyBytes(stats.size)),
      e("td", null, isDir ? "-" : formatTime(stats.mtime))
    );
  });

  if (dir !== "/") {
    rows.unshift(
      e(
        "tr",
        { key: "..", className: "odd" },
        e("td", null, e("a", { title: "Parent directory", href: "../" }, "..")),
        e("td", null, "-"),
        e("td", null, "-"),
        e("td", null, "-")
      )
    );
  }

  return e(
    "table",
    null,
    e(
      "thead",
      null,
      e(
        "tr",
        null,
        e("th", null, "Name"),
        e("th", null, "Type"),
        e("th", null, "Size"),
        e("th", null, "Last Modified")
      )
    ),
    e("tbody", null, rows)
  );
}

module.exports = DirectoryListing;
