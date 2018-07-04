const path = require("path");
const formatBytes = require("pretty-bytes");
const sortBy = require("sort-by");

const cloneElement = require("./utils/cloneElement");
const e = require("./utils/createElement");

function stripLeadingSegment(name) {
  return name.replace(/^[^\/]+\//, "");
}

function getValues(object) {
  return Object.keys(object).map(key => object[key]);
}

function DirectoryListing({ filename, entry, entries }) {
  const rows = [];

  if (filename !== "/") {
    rows.push(
      e(
        "tr",
        { key: ".." },
        e("td", null, e("a", { title: "Parent directory", href: "../" }, "..")),
        e("td", null, "-"),
        e("td", null, "-"),
        e("td", null, "-")
      )
    );
  }

  const matchingEntries = getValues(entries).filter(
    ({ name }) =>
      entry.name !== name && path.dirname(name) === (entry.name || ".")
  );

  matchingEntries
    .filter(({ type }) => type === "directory")
    .sort(sortBy("name"))
    .forEach(({ name }) => {
      const relName = stripLeadingSegment(name);
      const href = relName + "/";

      rows.push(
        e(
          "tr",
          { key: name },
          e("td", null, e("a", { title: relName, href }, href)),
          e("td", null, "-"),
          e("td", null, "-"),
          e("td", null, "-")
        )
      );
    });

  matchingEntries
    .filter(({ type }) => type === "file")
    .sort(sortBy("name"))
    .forEach(({ name, size, contentType, lastModified }) => {
      const relName = stripLeadingSegment(name);

      rows.push(
        e(
          "tr",
          { key: name },
          e("td", null, e("a", { title: relName, href: relName }, relName)),
          e("td", null, contentType),
          e("td", null, formatBytes(size)),
          e("td", null, lastModified)
        )
      );
    });

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
    e(
      "tbody",
      null,
      rows.map((row, index) =>
        cloneElement(row, {
          className: index % 2 ? "odd" : "even"
        })
      )
    )
  );
}

module.exports = DirectoryListing;
