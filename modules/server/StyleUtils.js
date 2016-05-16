import fs from 'fs'
import path from 'path'
import csso from 'csso'

export const readCSS = (...args) =>
  minifyCSS(fs.readFileSync(path.resolve.apply(path, args), 'utf8'))

export const minifyCSS = (css) =>
  csso.minify(css).css
