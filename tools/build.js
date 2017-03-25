const { execSync } = require('child_process')

console.log('Building CommonJS modules ...')

execSync('rimraf lib && babel ./modules -d lib --copy-files', {
  stdio: 'inherit'
})

console.log('\nBuilding client bundles ...')

execSync('webpack -p --json > stats.json', {
  stdio: 'inherit',
  env: Object.assign({}, process.env, {
    NODE_ENV: 'production'
  })
})
