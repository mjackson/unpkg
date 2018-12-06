// Use babel to compile JSX on the fly.
require("@babel/register")({
  only: [/modules\/client/]
});

// Ignore require("*.css") calls.
require.extensions[".css"] = function() {
  return {};
};
