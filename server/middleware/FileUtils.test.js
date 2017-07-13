const { getContentType, getStats, getFileType } = require('./FileUtils');

it('gets a contextType of text/plain for LICENSE|README|CHANGES|AUTHORS|Makefile', () => {
  expect(getContentType('LICENSE')).toBe('text/plain');
  expect(getContentType('README')).toBe('text/plain');
  expect(getContentType('CHANGES')).toBe('text/plain');
  expect(getContentType('AUTHORS')).toBe('text/plain');
  expect(getContentType('Makefile')).toBe('text/plain');
});

it('gets a contextType of text/plain for .*rc files', () => {
  expect(getContentType('.eslintrc')).toBe('text/plain');
  expect(getContentType('.babelrc')).toBe('text/plain');
  expect(getContentType('.anythingrc')).toBe('text/plain');
});

it('gets a contextType of text/plain for .git* files', () => {
  expect(getContentType('.gitignore')).toBe('text/plain');
  expect(getContentType('.gitanything')).toBe('text/plain');
});

it('gets a contextType of text/plain for .*ignore files', () => {
  expect(getContentType('.eslintignore')).toBe('text/plain');
  expect(getContentType('.anythingignore')).toBe('text/plain');
});

it('gets a contextType of text/plain for .ts files', () => {
  expect(getContentType('app.ts')).toBe('text/plain');
  expect(getContentType('app.d.ts')).toBe('text/plain');
});