import parsePackagePathname from '../parsePackagePathname.js';

describe('parsePackagePathname', () => {
  it('parses plain packages', () => {
    expect(parsePackagePathname('/history@1.0.0/umd/history.min.js')).toEqual({
      packageName: 'history',
      packageVersion: '1.0.0',
      packageSpec: 'history@1.0.0',
      filename: '/umd/history.min.js'
    });
  });

  it('parses plain packages with a hyphen in the name', () => {
    expect(parsePackagePathname('/query-string@5.0.0/index.js')).toEqual({
      packageName: 'query-string',
      packageVersion: '5.0.0',
      packageSpec: 'query-string@5.0.0',
      filename: '/index.js'
    });
  });

  it('parses plain packages with no version specified', () => {
    expect(parsePackagePathname('/query-string/index.js')).toEqual({
      packageName: 'query-string',
      packageVersion: 'latest',
      packageSpec: 'query-string@latest',
      filename: '/index.js'
    });
  });

  it('parses plain packages with version spec', () => {
    expect(parsePackagePathname('/query-string@>=4.0.0/index.js')).toEqual({
      packageName: 'query-string',
      packageVersion: '>=4.0.0',
      packageSpec: 'query-string@>=4.0.0',
      filename: '/index.js'
    });
  });

  it('parses scoped packages', () => {
    expect(
      parsePackagePathname('/@angular/router@4.3.3/src/index.d.ts')
    ).toEqual({
      packageName: '@angular/router',
      packageVersion: '4.3.3',
      packageSpec: '@angular/router@4.3.3',
      filename: '/src/index.d.ts'
    });
  });

  it('parses package names with a period in them', () => {
    expect(parsePackagePathname('/index.js')).toEqual({
      packageName: 'index.js',
      packageVersion: 'latest',
      packageSpec: 'index.js@latest',
      filename: ''
    });
  });
});
