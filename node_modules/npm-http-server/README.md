# npm-http-server

npm-http-server is a small HTTP server that serves up files from npm packages.

## Installation

    $ npm install npm-http-server

## Configuration and Usage

Use `createServer` to create a server instance, passing it the options it needs to connect to [npm](https://npmjs.org):

```js
import { createServer } from 'npm-http-server'

const server = createServer({
  registryURL: 'https://registry.npmjs.org',  // The URL of the npm registry, defaults to the public registry
  bowerBundle: '/bower.zip'                   // A special pathname for generating Bower bundles, defaults to "/bower.zip"
})

server.listen(8080)
```

`server` is a standard [node HTTP server](https://nodejs.org/api/http.html#http_class_http_server).

## URL Format

In npm-http-server, the URL is the API. The server recognizes URLs in the format `/package@version/path/to/file` where:

    package         The @scope/name of an npm package (scope is optional)
    version         The version, version range, or tag
    /path/to/file   The path to a file in that package (optional, defaults to main module)

### Bower Support

To get a Bower bundle from a package that supports it use the `/bower.zip` file path. The zip archive that Bower needs is created dynamically based on the config in `bower.json`. The archive contains `bower.json` and all files listed in its `main` section. For convenience, the `version` number is automatically replaced with the one from `package.json` so there is no need to manually update it.

**Please note: *We do NOT recommend JavaScript libraries use Bower*.** It was originally written to solve the problem of bundling CSS and other static assets together with JavaScript in a single package. However, that problem is much more ably solved by bundlers like webpack and Browserify at build time. Additionally, Bower requires JavaScript libraries to check their build into GitHub (see [why this is bad](https://medium.com/@kentcdodds/why-i-don-t-commit-generated-files-to-master-a4d76382564#.txdxyz5gy)) and publish to the Bower registry, both of which are extra overhead that can be avoided by publishing just the source to npm and using a postinstall script to generate the build.
