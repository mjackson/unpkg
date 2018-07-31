unpkg is a fast, global [content delivery network](https://en.wikipedia.org/wiki/Content_delivery_network) for everything on [npm](https://www.npmjs.com/). Use it to quickly and easily load any file from any package using a URL like:

<div class="home-example">unpkg.com/:package@:version/:file</div>

### Examples

Using a fixed version:

  * [unpkg.com/react@16.0.0/umd/react.production.min.js](/react@16.0.0/umd/react.production.min.js)
  * [unpkg.com/react-dom@16.0.0/umd/react-dom.production.min.js](/react-dom@16.0.0/umd/react-dom.production.min.js)

You may also use a [semver range](https://docs.npmjs.com/misc/semver) or a [tag](https://docs.npmjs.com/cli/dist-tag) instead of a fixed version number, or omit the version/tag entirely to use the `latest` tag.

  * [unpkg.com/react@^16/umd/react.production.min.js](/react@^16/umd/react.production.min.js)
  * [unpkg.com/react/umd/react.production.min.js](/react/umd/react.production.min.js)

If you omit the file path (i.e. use a "bare" URL), unpkg will serve the file specified by the `unpkg` field in `package.json`, or fall back to `main`.

  * [unpkg.com/d3](/d3)
  * [unpkg.com/jquery](/jquery)
  * [unpkg.com/three](/three)

Append a `/` at the end of a URL to view a listing of all the files in a package.

  * [unpkg.com/react/](/react/)
  * [unpkg.com/lodash/](/lodash/)

### Query Parameters

<dl>
  <dt>`?meta`</dt>
  <dd>Return metadata about any file in a package as JSON (e.g. `/any/file?meta`)</dd>

  <dt>`?module`</dt>
  <dd>Expands all ["bare" `import` specifiers](https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier) in JavaScript modules to unpkg URLs. This feature is *very experimental*</dd>
</dl>

### Workflow

For npm package authors, unpkg relieves the burden of publishing your code to a CDN in addition to the npm registry. All you need to do is include your [UMD](https://github.com/umdjs/umd) build in your npm package (not your repo, that's different!).

You can do this easily using the following setup:

  * Add the `umd` (or `dist`) directory to your `.gitignore` file
  * Add the `umd` directory to your [files array](https://docs.npmjs.com/files/package.json#files) in `package.json`
  * Use a build script to generate your UMD build in the `umd` directory when you publish

That's it! Now when you `npm publish` you'll have a version available on unpkg as well.
