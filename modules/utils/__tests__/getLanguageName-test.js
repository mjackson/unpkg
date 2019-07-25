import getLanguageName from '../getLanguageName.js';

describe('getLanguageName', () => {
  // Hard-coded overrides

  it('detects Flow files', () => {
    expect(getLanguageName('react.flow')).toBe('Flow');
  });

  it('detects source maps', () => {
    expect(getLanguageName('react.map')).toBe('Source Map (JSON)');
    expect(getLanguageName('react.js.map')).toBe('Source Map (JSON)');
    expect(getLanguageName('react.json.map')).toBe('Source Map (JSON)');
  });

  it('detects TypeScript files', () => {
    expect(getLanguageName('react.d.ts')).toBe('TypeScript');
    expect(getLanguageName('react.tsx')).toBe('TypeScript');
  });

  // Content-Type lookups

  it('detects JavaScript files', () => {
    expect(getLanguageName('react.js')).toBe('JavaScript');
  });

  it('detects JSON files', () => {
    expect(getLanguageName('react.json')).toBe('JSON');
  });

  it('detects binary files', () => {
    expect(getLanguageName('ionicons.bin')).toBe('Binary');
  });

  it('detects EOT files', () => {
    expect(getLanguageName('ionicons.eot')).toBe('Embedded OpenType');
  });

  it('detects SVG files', () => {
    expect(getLanguageName('react.svg')).toBe('SVG');
  });

  it('detects TTF files', () => {
    expect(getLanguageName('ionicons.ttf')).toBe('TrueType Font');
  });

  it('detects WOFF files', () => {
    expect(getLanguageName('ionicons.woff')).toBe('WOFF');
  });

  it('detects WOFF2 files', () => {
    expect(getLanguageName('ionicons.woff2')).toBe('WOFF2');
  });

  it('detects CSS files', () => {
    expect(getLanguageName('react.css')).toBe('CSS');
  });

  it('detects HTML files', () => {
    expect(getLanguageName('react.html')).toBe('HTML');
  });

  it('detects JSX files', () => {
    expect(getLanguageName('react.jsx')).toBe('JSX');
  });

  it('detects Markdown files', () => {
    expect(getLanguageName('README.md')).toBe('Markdown');
  });

  it('detects plain text files', () => {
    expect(getLanguageName('README')).toBe('Plain Text');
    expect(getLanguageName('LICENSE')).toBe('Plain Text');
  });

  it('detects SCSS files', () => {
    expect(getLanguageName('some.scss')).toBe('SCSS');
  });

  it('detects YAML files', () => {
    expect(getLanguageName('config.yml')).toBe('YAML');
    expect(getLanguageName('config.yaml')).toBe('YAML');
  });
});
