unpkg is a fast, global [content delivery network](https://en.wikipedia.org/wiki/Content_delivery_network) for everything on [npm](https://www.npmjs.com/). Use it to quickly and easily load any file from any package using a URL like:

<div class="home-example">unpkg.com/:package@:version/:file</div>

### Examples

Using a fixed version:

  * [unpkg.com/react@15.3.1/dist/react.min.js](/react@15.3.1/dist/react.min.js)
  * [unpkg.com/react-dom@15.3.1/dist/react-dom.min.js](/react-dom@15.3.1/dist/react-dom.min.js)

You may also use a [semver range](https://docs.npmjs.com/misc/semver) or a [tag](https://docs.npmjs.com/cli/dist-tag) instead of a fixed version number, or omit the version/tag entirely to use the `latest` tag.

  * [unpkg.com/react@^15/dist/react.min.js](/react@^15/dist/react.min.js)
  * [unpkg.com/react/dist/react.min.js](/react/dist/react.min.js)

If you omit the file path, unpkg will serve the package's "main" file.

  * [unpkg.com/jquery](/jquery)
  * [unpkg.com/three](/three)

Append a `/` at the end of a URL to view a listing of all the files in a package.

  * [unpkg.com/react/](/react/)
  * [unpkg.com/lodash/](/lodash/)

### Query Parameters

<dl>
  <dt>`?main=:mainField`</dt>
  <dd>The name of the field in [package.json](https://docs.npmjs.com/files/package.json) to use as the main entry point when there is no file path in the URL. Defaults to using `unpkg`, [`browser`](https://github.com/defunctzombie/package-browser-field-spec), and then [`main`](https://docs.npmjs.com/files/package.json#main).</dd>

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
