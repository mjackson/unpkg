const semver = require("semver");

const DirectoryListing = require("./DirectoryListing");
const readCSS = require("./utils/readCSS");
const e = require("./utils/createElement");
const s = require("./utils/createStyle");
const x = require("./utils/createScript");

const IndexPageStyle = readCSS(__dirname, "IndexPage.css");
const IndexPageScript = `
var s = document.getElementById('version'), v = s.value;
s.onchange = function () {
  window.location.href = window.location.href.replace('@' + v, '@' + s.value);
};
`;

function byVersion(a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}

function IndexPage({ packageInfo, version, filename, entry, entries }) {
  const versions = Object.keys(packageInfo.versions).sort(byVersion);
  const options = versions.map(v =>
    e("option", { key: v, value: v }, `${packageInfo.name}@${v}`)
  );

  return e(
    "html",
    null,
    e(
      "head",
      null,
      e("meta", { charSet: "utf-8" }),
      e("title", null, `Index of ${filename}`),
      s(IndexPageStyle)
    ),
    e(
      "body",
      null,
      e(
        "div",
        { className: "content-wrapper" },
        e(
          "div",
          { className: "version-wrapper" },
          e("select", { id: "version", defaultValue: version }, options)
        ),
        e("h1", null, `Index of ${filename}`),
        x(IndexPageScript),
        e("hr"),
        e(DirectoryListing, { filename, entry, entries }),
        e("hr"),
        e("address", null, `${packageInfo.name}@${version}`)
      )
    )
  );
}

module.exports = IndexPage;
