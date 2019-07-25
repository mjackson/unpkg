import getContentType from '../getContentType.js';

describe('getContentType', () => {
  it('returns text/plain for LICENSE|README|CHANGES|AUTHORS|Makefile', () => {
    expect(getContentType('AUTHORS')).toBe('text/plain');
    expect(getContentType('CHANGES')).toBe('text/plain');
    expect(getContentType('LICENSE')).toBe('text/plain');
    expect(getContentType('Makefile')).toBe('text/plain');
    expect(getContentType('PATENTS')).toBe('text/plain');
    expect(getContentType('README')).toBe('text/plain');
  });

  it('returns text/plain for .*rc files', () => {
    expect(getContentType('.eslintrc')).toBe('text/plain');
    expect(getContentType('.babelrc')).toBe('text/plain');
    expect(getContentType('.anythingrc')).toBe('text/plain');
  });

  it('returns text/plain for .git* files', () => {
    expect(getContentType('.gitignore')).toBe('text/plain');
    expect(getContentType('.gitanything')).toBe('text/plain');
  });

  it('returns text/plain for .*ignore files', () => {
    expect(getContentType('.eslintignore')).toBe('text/plain');
    expect(getContentType('.anythingignore')).toBe('text/plain');
  });

  it('returns text/plain for .ts(x) files', () => {
    expect(getContentType('app.ts')).toBe('text/plain');
    expect(getContentType('app.d.ts')).toBe('text/plain');
    expect(getContentType('app.tsx')).toBe('text/plain');
  });

  it('returns text/plain for .flow files', () => {
    expect(getContentType('app.js.flow')).toBe('text/plain');
  });

  it('returns text/plain for .lock files', () => {
    expect(getContentType('yarn.lock')).toBe('text/plain');
  });

  it('returns application/json for .map files', () => {
    expect(getContentType('react.js.map')).toBe('application/json');
    expect(getContentType('react.json.map')).toBe('application/json');
  });
});
