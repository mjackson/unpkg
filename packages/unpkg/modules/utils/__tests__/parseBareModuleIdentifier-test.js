const parseBareModuleIdentifier = require('../parseBareModuleIdentifier')

describe('parseBareModuleIdentifier', () => {
  it('parses simple identifiers', () => {
    expect(parseBareModuleIdentifier('react')).toEqual({
      packageName: 'react',
      file: ''
    })
  })

  it('parses hyphenated identifiers', () => {
    expect(parseBareModuleIdentifier('react-dom')).toEqual({
      packageName: 'react-dom',
      file: ''
    })
  })

  it('parses hyphenated identifiers with a filename', () => {
    expect(parseBareModuleIdentifier('react-dom/server')).toEqual({
      packageName: 'react-dom',
      file: '/server'
    })
  })

  it('parses scoped identifiers', () => {
    expect(parseBareModuleIdentifier('@babel/core')).toEqual({
      packageName: '@babel/core',
      file: ''
    })
  })

  it('parses scoped identifiers with a filename', () => {
    expect(parseBareModuleIdentifier('@babel/core/package.json')).toEqual({
      packageName: '@babel/core',
      file: '/package.json'
    })
  })
})
