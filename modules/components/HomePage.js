import React from 'react'
import { readCSS } from '../StyleUtils'

const HomePage = React.createClass({
  statics: {
    css: readCSS(__dirname, './HomePage.css')
  },

  render() {
    return (
      <html>
        <head>
          <title>npmcdn</title>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <meta name="rendered-at" content={(new Date).toISOString()}/>
          <style dangerouslySetInnerHTML={{ __html: HomePage.css }}/>
        </head>
        <body>
          <header>
            <h1>npmcdn</h1>
          </header>
          <section id="wrapper">
            <p>npmcdn is a CDN for packages that are published via <a href="https://www.npmjs.com/">npm</a>. Use it to quickly and easily load files using a simple URL like <code>https://npmcdn.com/package@version/path/to/file</code>.</p>
            <p>A few examples:</p>
            <ul>
              <li><a href="/react@15.0.1/dist/react.min.js">https://npmcdn.com/react@15.0.1/dist/react.min.js</a></li>
              <li><a href="/react-dom@15.0.1/dist/react-dom.min.js">https://npmcdn.com/react-dom@15.0.1/dist/react-dom.min.js</a></li>
              <li><a href="/history@1.12.5/umd/History.min.js">https://npmcdn.com/history@1.12.5/umd/History.min.js</a></li>
              <li><a href="/react-router@1.0.0/umd/ReactRouter.min.js">https://npmcdn.com/react-router@1.0.0/umd/ReactRouter.min.js</a></li>
            </ul>

            <p>You may also use a <a href="https://docs.npmjs.com/cli/dist-tag">tag</a> or <a href="https://docs.npmjs.com/misc/semver">version range</a> instead of a fixed version number, or omit the version/tag entirely to use the <code>latest</code> tag.</p>
            <ul>
              <li><a href="/react@^0.14/dist/react.min.js">https://npmcdn.com/react@^0.14/dist/react.min.js</a></li>
              <li><a href="/react/dist/react.min.js">https://npmcdn.com/react/dist/react.min.js</a></li>
            </ul>

            <p>If you omit the file path, the <a href="https://docs.npmjs.com/files/package.json#main">main module</a> will be served. This is especially useful for loading libaries that publish a UMD build as their main module.</p>
            <ul>
              <li><a href="/three">https://npmcdn.com/three</a></li>
              <li><a href="/jquery">https://npmcdn.com/jquery</a></li>
              <li><a href="/angular-formly">https://npmcdn.com/angular-formly</a></li>
            </ul>

            <p>Append a <code>/</code> at the end of a URL to view a listing of all the files in a package.</p>
            <ul>
              <li><a href="/lodash/">https://npmcdn.com/lodash/</a></li>
              <li><a href="/modernizr/">https://npmcdn.com/modernizr/</a></li>
              <li><a href="/react/">https://npmcdn.com/react/</a></li>
            </ul>

            <p>You may use the special <code>/bower.zip</code> file path in packages that contain a <code>bower.json</code> file to dynamically generate a zip file that Bower can use to install the package.</p>
            <ul>
              <li><a href="/react-swap/bower.zip">https://npmcdn.com/react-swap/bower.zip</a></li>
              <li><a href="/react-collapse@1.6.3/bower.zip">https://npmcdn.com/react-collapse@1.6.3/bower.zip</a></li>
            </ul>

            <p><strong>Please note: <em>We do NOT recommend JavaScript libraries use Bower.</em></strong> Bower places additional burdens on JavaScript package authors for little to no gain. npmcdn is intended to make it easier to publish code, not harder, so Bower support will be removed in January 2017. Please move to npm for installing packages and stop using Bower before that time. See <a href="https://github.com/mjackson/npm-http-server#bower-support">here</a> for our rationale.</p>

            <h3>Query Parameters</h3>
            <table cellPadding="0" cellSpacing="0">
              <thead>
                <tr>
                  <th width="80px">Name</th>
                  <th width="120px">Default Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>main</code></td>
                  <td><code>main</code></td>
                  <td>The name of the field in <a href="https://docs.npmjs.com/files/package.json">package.json</a> to use as the main entry point when there is no file path in the URL (e.g. <code>?main=browser</code>).</td>
                </tr>
              </tbody>
            </table>

            <h3>Suggested Workflow</h3>
            <p>For npm package authors, npmcdn relieves the burden of publishing your code to a CDN in addition to the npm registry. All you need to do is include your <a href="https://github.com/umdjs/umd">UMD</a> build in your npm package (not your repo, that's different!).</p>
            <p>You can do this easily using the following setup:</p>
            <ul>
              <li>Add the <code>umd</code> (or <code>dist</code>) directory to your <code>.gitignore</code> file</li>
              <li>Add the <code>umd</code> directory to your <a href="https://docs.npmjs.com/files/package.json#files">files array</a> in <code>package.json</code></li>
              <li>Use a build script to generate your UMD build in the <code>umd</code> directory when you publish</li>
            </ul>
            <p>That's it! Now when you <code>npm publish</code> you'll have a version available on npmcdn as well.</p>

            <h3>Feedback</h3>
            <p>If you think this is useful, I'd love to hear from you. Please reach out to <a href="https://twitter.com/mjackson">@mjackson</a> with any questions/concerns.</p>
            <p>Also, please feel free to examine the source on <a href="https://github.com/mjackson/npmcdn.com">GitHub</a>.</p>
          </section>
        </body>
      </html>
    )
  }
})

export default HomePage
