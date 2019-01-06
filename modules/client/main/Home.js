import React from 'react';

import Wrapper from './Wrapper';

const styles = {
  homeExample: {
    textAlign: 'center',
    backgroundColor: '#eee',
    margin: '2em 0',
    padding: '5px 0'
  }
};

export default function Home() {
  return (
    <Wrapper>
      <p>
        unpkg is a fast, global{' '}
        <a href="https://en.wikipedia.org/wiki/Content_delivery_network">
          content delivery network
        </a>{' '}
        for everything on <a href="https://www.npmjs.com/">npm</a>. Use it to
        quickly and easily load any file from any package using a URL like:
      </p>

      <div style={styles.homeExample}>unpkg.com/:package@:version/:file</div>

      <h3>Examples</h3>

      <p>Using a fixed version:</p>

      <ul>
        <li>
          <a href="/react@16.0.0/umd/react.production.min.js">
            unpkg.com/react@16.0.0/umd/react.production.min.js
          </a>
        </li>
        <li>
          <a href="/react-dom@16.0.0/umd/react-dom.production.min.js">
            unpkg.com/react-dom@16.0.0/umd/react-dom.production.min.js
          </a>
        </li>
      </ul>

      <p>
        You may also use a{' '}
        <a href="https://docs.npmjs.com/misc/semver">semver range</a> or a{' '}
        <a href="https://docs.npmjs.com/cli/dist-tag">tag</a> instead of a fixed
        version number, or omit the version/tag entirely to use the{' '}
        <code>latest</code> tag.
      </p>

      <ul>
        <li>
          <a href="/react@^16/umd/react.production.min.js">
            unpkg.com/react@^16/umd/react.production.min.js
          </a>
        </li>
        <li>
          <a href="/react/umd/react.production.min.js">
            unpkg.com/react/umd/react.production.min.js
          </a>
        </li>
      </ul>

      <p>
        If you omit the file path (i.e. use a &ldquo;bare&rdquo; URL), unpkg
        will serve the file specified by the <code>unpkg</code> field in{' '}
        <code>package.json</code>, or fall back to
        <code>main</code>.
      </p>

      <ul>
        <li>
          <a href="/d3">unpkg.com/d3</a>
        </li>
        <li>
          <a href="/jquery">unpkg.com/jquery</a>
        </li>
        <li>
          <a href="/three">unpkg.com/three</a>
        </li>
      </ul>

      <p>
        Append a <code>/</code> at the end of a URL to view a listing of all the
        files in a package.
      </p>

      <ul>
        <li>
          <a href="/react/">unpkg.com/react/</a>
        </li>
        <li>
          <a href="/lodash/">unpkg.com/lodash/</a>
        </li>
      </ul>

      <h3>Query Parameters</h3>

      <dl>
        <dt>
          <code>?meta</code>
        </dt>
        <dd>
          Return metadata about any file in a package as JSON (e.g.
          <code>/any/file?meta</code>)
        </dd>

        <dt>
          <code>?module</code>
        </dt>
        <dd>
          Expands all{' '}
          <a href="https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier">
            &ldquo;bare&rdquo; <code>import</code> specifiers
          </a>
          in JavaScript modules to unpkg URLs. This feature is{' '}
          <em>very experimental</em>
        </dd>
      </dl>

      <h3>Workflow</h3>

      <p>
        For npm package authors, unpkg relieves the burden of publishing your
        code to a CDN in addition to the npm registry. All you need to do is
        include your <a href="https://github.com/umdjs/umd">UMD</a> build in
        your npm package (not your repo, that&apos;s different!).
      </p>

      <p>You can do this easily using the following setup:</p>

      <ul>
        <li>
          Add the <code>umd</code> (or <code>dist</code>) directory to your{' '}
          <code>.gitignore</code> file
        </li>
        <li>
          Add the <code>umd</code> directory to your{' '}
          <a href="https://docs.npmjs.com/files/package.json#files">
            files array
          </a>{' '}
          in
          <code>package.json</code>
        </li>
        <li>
          Use a build script to generate your UMD build in the <code>umd</code>{' '}
          directory when you publish
        </li>
      </ul>

      <p>
        That&apos;s it! Now when you <code>npm publish</code> you&apos;ll have a
        version available on unpkg as well.
      </p>
    </Wrapper>
  );
}
