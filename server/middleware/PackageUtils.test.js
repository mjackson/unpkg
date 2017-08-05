const { parsePackageURL } = require('./PackageUtils')

describe('parsePackageURL', () => {
  it('parses plain packages', () => {
    expect(parsePackageURL('/history@1.0.0/umd/history.min.js')).toEqual({
      pathname: '/history@1.0.0/umd/history.min.js',
      search: '',
      query: {},
      packageName: 'history',
      version: '1.0.0',
      filename: '/umd/history.min.js'
    })
  })

  it('parses plain packages with a hyphen in the name', () => {
    expect(parsePackageURL('/query-string@5.0.0/index.js')).toEqual({
      pathname: '/query-string@5.0.0/index.js',
      search: '',
      query: {},
      packageName: 'query-string',
      version: '5.0.0',
      filename: '/index.js'
    })
  })

  it('parses plain packages with no version specified', () => {
    expect(parsePackageURL('/query-string/index.js')).toEqual({
      pathname: '/query-string/index.js',
      search: '',
      query: {},
      packageName: 'query-string',
      version: 'latest',
      filename: '/index.js'
    })
  })

  it('parses plain packages with version specs', () => {
    expect(parsePackageURL('/query-string@>=4.0.0/index.js')).toEqual({
      pathname: '/query-string@>=4.0.0/index.js',
      search: '',
      query: {},
      packageName: 'query-string',
      version: '>=4.0.0',
      filename: '/index.js'
    })
  })

  it('parses scoped packages', () => {
    expect(parsePackageURL('/@angular/router@4.3.3/src/index.d.ts')).toEqual({
      pathname: '/@angular/router@4.3.3/src/index.d.ts',
      search: '',
      query: {},
      packageName: '@angular/router',
      version: '4.3.3',
      filename: '/src/index.d.ts'
    })
  })

  it('parses package names with a period in them', () => {
    expect(parsePackageURL('/index.js')).toEqual({
      pathname: '/index.js',
      search: '',
      query: {},
      packageName: 'index.js',
      version: 'latest',
      filename: ''
    })
  })

  it('parses valid query parameters', () => {
    expect(parsePackageURL('/history?main=browser')).toEqual({
      pathname: '/history',
      search: '?main=browser',
      query: { main: 'browser' },
      packageName: 'history',
      version: 'latest',
      filename: ''
    })
  })

  it('returns null for invalid pathnames', () => {
    expect(parsePackageURL('history')).toBe(null)
  })

  it('returns null for invalid query parameters', () => {
    expect(parsePackageURL('/query-string@5.0.0/index.js?invalid')).toBe(null)
  })
})
