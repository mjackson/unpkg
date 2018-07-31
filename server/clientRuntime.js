// Use babel to compile JSX on the fly.
require("babel-register")({
  only: /server\/client/
});

// Ignore require("*.css") calls.
require.extensions[".css"] = function() {
  return {};
};
