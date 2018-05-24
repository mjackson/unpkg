# unpkg [![Travis][build-badge]][build]

[build-badge]: https://img.shields.io/travis/unpkg/unpkg/master.svg?style=flat-square
[build]: https://travis-ci.org/unpkg/unpkg

[unpkg](https://unpkg.com) is a fast, global [content delivery network](https://en.wikipedia.org/wiki/Content_delivery_network) for everything on [npm](https://www.npmjs.com/). Use it to quickly and easily load any file from any package using a URL like:

<div style="text-align:center">
  <code>unpkg.com/:package@:version/:file</code>
</div>

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

**To view a source file in your browser, add the `html` parameter:**
* [unpkg.com/react@^16/umd/react.production.min.js?html](/react@^16/umd/react.production.min.js?html)
* [unpkg.com/jquery@3.3.1/dist/jquery.js?html](/jquery@3.3.1/dist/jquery.js?html)

### Query Parameters

<dl>
  <dt>?meta</dt>
  <dd>Return metadata about any file in a package as JSON (e.g. `/any/file?meta`)</dd>
  
  <dt>?html</dt>
  <dd>Return file as html page (e.g. `/any/file?html`)</dd>

  <dt>?module</dt>
  <dd>Expands all ["bare" `import` specifiers](https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier) in JavaScript modules to unpkg URLs. This feature is *very experimental*</dd>

</dl>

### Cache Behavior

The CDN caches files based on their permanent URL, which includes the npm package version. This works because npm does not allow package authors to overwrite a package that has already been published with a different one at the same version number.

URLs that do not specify a package version number redirect to one that does. This is the `latest` version when no version is specified, or the `maxSatisfying` version when a [semver version](https://github.com/npm/node-semver) is given. Redirects are cached for 5 minutes.

Browsers are instructed (via the `Cache-Control` header) to cache assets for 4 hours.

### Feedback

If you think this is useful, we'd love to hear from you. Please reach out to [@unpkg](https://twitter.com/unpkg) with any questions or concerns.

### Sponsors

The project is sponsored by [Cloudflare](https://cloudflare.com) and [Heroku](https://heroku.com).
