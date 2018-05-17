exports.port = parseInt(process.env.PORT, 10) || 5000;

exports.origin =
  process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test"
    ? "https://unpkg.com"
    : `http://localhost:${exports.port}`;

exports.registryURL =
  process.env.NPM_REGISTRY_URL || "https://registry.npmjs.org";
