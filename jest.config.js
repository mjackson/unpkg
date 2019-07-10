module.exports = {
  moduleNameMapper: {
    'entry-manifest': '<rootDir>/modules/__mocks__/entryManifest.js',
    '\\.png$': '<rootDir>/modules/__mocks__/imageMock.js',
    '\\.css$': '<rootDir>/modules/__mocks__/styleMock.js'
  },
  testMatch: ['**/__tests__/*-test.js'],
  testURL: 'http://localhost/'
};
