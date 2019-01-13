import React from 'react';
import PropTypes from 'prop-types';
import formatBytes from 'pretty-bytes';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';

import formatNumber from '../utils/formatNumber';
import formatPercent from '../utils/formatPercent';

import cloudflareLogo from './CloudflareLogo.png';
import herokuLogo from './HerokuLogo.png';

const styles = {
  title: {
    margin: 0,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontSize: '5em'
  },
  nav: {
    margin: '0 0 3em'
  },
  navList: {
    margin: 0,
    padding: 0,
    display: 'flex',
    justifyContent: 'center'
  },
  navListItem: {
    flexBasis: 'auto',
    listStyleType: 'none',
    display: 'inline-block',
    fontSize: '1.1em',
    margin: '0 10px'
  },
  navLink: {
    textDecoration: 'none',
    color: 'black'
  },
  navUnderline: {
    height: 4,
    backgroundColor: 'black',
    position: 'absolute',
    left: 0
  },
  example: {
    textAlign: 'center',
    backgroundColor: '#eee',
    margin: '2em 0',
    padding: '5px 0'
  },
  logoList: {
    margin: '2em 0',
    display: 'flex',
    justifyContent: 'center'
  },
  logo: {
    textAlign: 'center',
    flex: '1',
    maxWidth: '80%'
  },
  logoImage: {
    maxWidth: '60%'
  }
};

function AboutLogo({ children }) {
  return <div style={styles.logo}>{children}</div>;
}

function AboutLogoImage(props) {
  return <img {...props} style={styles.logoImage} />;
}

function Stats({ data }) {
  const totals = data.totals;
  const since = parseDate(totals.since);
  const until = parseDate(totals.until);

  return (
    <p>
      From <strong>{formatDate(since, 'MMM D')}</strong> to{' '}
      <strong>{formatDate(until, 'MMM D')}</strong> unpkg served{' '}
      <strong>{formatNumber(totals.requests.all)}</strong> requests and a total
      of <strong>{formatBytes(totals.bandwidth.all)}</strong> of data to{' '}
      <strong>{formatNumber(totals.uniques.all)}</strong> unique visitors,{' '}
      <strong>
        {formatPercent(totals.requests.cached / totals.requests.all, 0)}%
      </strong>{' '}
      of which were served from the cache.
    </p>
  );
}

export default class App extends React.Component {
  state = { stats: null };

  componentDidMount() {
    fetch('/api/stats?period=last-month')
      .then(res => res.json())
      .then(stats => this.setState({ stats }));

    if (window.localStorage) {
      const savedStats = window.localStorage.savedStats;

      if (savedStats) this.setState({ stats: JSON.parse(savedStats) });

      window.onbeforeunload = () => {
        localStorage.savedStats = JSON.stringify(this.state.stats);
      };
    }
  }

  render() {
    const { stats } = this.state;

    return (
      <div className="wrapper">
        <header>
          <h1 style={styles.title}>unpkg</h1>

          <p>
            unpkg is a fast, global{' '}
            <a href="https://en.wikipedia.org/wiki/Content_delivery_network">
              content delivery network
            </a>{' '}
            for everything on <a href="https://www.npmjs.com/">npm</a>. Use it
            to quickly and easily load any file from any package using a URL
            like:
          </p>

          <div style={styles.example}>unpkg.com/:package@:version/:file</div>

          {stats && <Stats data={stats} />}
        </header>

        <h3>Examples</h3>

        <p>Using a fixed version:</p>

        <ul>
          <li>
            <a href="/react@16.7.0/umd/react.production.min.js">
              unpkg.com/react@16.7.0/umd/react.production.min.js
            </a>
          </li>
          <li>
            <a href="/react-dom@16.7.0/umd/react-dom.production.min.js">
              unpkg.com/react-dom@16.7.0/umd/react-dom.production.min.js
            </a>
          </li>
        </ul>

        <p>
          You may also use a{' '}
          <a href="https://docs.npmjs.com/misc/semver">semver range</a> or a{' '}
          <a href="https://docs.npmjs.com/cli/dist-tag">tag</a> instead of a
          fixed version number, or omit the version/tag entirely to use the{' '}
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
          Append a <code>/</code> at the end of a URL to view a listing of all
          the files in a package.
        </p>

        <ul>
          <li>
            <a href="/react/">unpkg.com/react/</a>
          </li>
          <li>
            <a href="/lodash/">unpkg.com/lodash/</a>
          </li>
        </ul>

        <h3 id="query-params">Query Parameters</h3>

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
            </a>{' '}
            in JavaScript modules to unpkg URLs. This feature is{' '}
            <em>very experimental</em>
          </dd>
        </dl>

        <h3 id="cache-behavior">Cache Behavior</h3>

        <p>
          The CDN caches files based on their permanent URL, which includes the
          npm package version. This works because npm does not allow package
          authors to overwrite a package that has already been published with a
          different one at the same version number.
        </p>
        <p>
          URLs that do not specify a package version number redirect to one that
          does. This is the <code>latest</code> version when no version is
          specified, or the <code>maxSatisfying</code> version when a{' '}
          <a href="https://github.com/npm/node-semver">semver version</a> is
          given. Redirects are cached for 5 minutes.
        </p>
        <p>
          Browsers are instructed (via the <code>Cache-Control</code> header) to
          cache assets for 1 year.
        </p>

        <h3 id="about">About</h3>

        <p>
          unpkg is an <a href="https://github.com/unpkg">open source</a> project
          built and maintained by{' '}
          <a href="https://twitter.com/mjackson">Michael Jackson</a>. unpkg is
          not affiliated with or supported by npm, Inc. in any way. Please do
          not contact npm for help with unpkg. Instead, please reach out to{' '}
          <a href="https://twitter.com/unpkg">@unpkg</a> with any questions or
          concerns.
        </p>

        <p>
          The fast, global infrastructure that powers unpkg is generously
          donated by <a href="https://www.cloudflare.com">Cloudflare</a> and{' '}
          <a href="https://www.heroku.com">Heroku</a>.
        </p>

        <div style={styles.logoList}>
          <AboutLogo>
            <a href="https://www.cloudflare.com">
              <AboutLogoImage src={cloudflareLogo} />
            </a>
          </AboutLogo>
          <AboutLogo>
            <a href="https://www.heroku.com">
              <AboutLogoImage src={herokuLogo} />
            </a>
          </AboutLogo>
        </div>

        <h3 id="workflow">Workflow</h3>

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
            Use a build script to generate your UMD build in the{' '}
            <code>umd</code> directory when you publish
          </li>
        </ul>

        <p>
          That&apos;s it! Now when you <code>npm publish</code> you&apos;ll have
          a version available on unpkg as well.
        </p>
      </div>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  App.propTypes = {
    location: PropTypes.object,
    children: PropTypes.node
  };
}
