module.exports = {
  moduleNameMapper: {
    "\\.css$": "<rootDir>/modules/__mocks__/styleMock.js"
  },
  setupTestFrameworkScriptFile:
    "<rootDir>/modules/__tests__/setupTestFramework.js",
  testMatch: ["**/__tests__/*-test.js"]
};
