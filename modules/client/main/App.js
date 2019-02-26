/** @jsx jsx */
import React from 'react';
import PropTypes from 'prop-types';
import { Global, css, jsx } from '@emotion/core';
import formatBytes from 'pretty-bytes';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';

import formatNumber from '../utils/formatNumber';
import formatPercent from '../utils/formatPercent';

import cloudflareLogo from './CloudflareLogo.png';
import angularLogo from './AngularLogo.png';
import googleCloudLogo from './GoogleCloudLogo.png';

const globalStyles = css`
  body {
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    line-height: 1.7;
    padding: 5px 20px;
    color: black;
  }

  @media (min-width: 800px) {
    body {
      padding: 40px 20px 120px;
    }
  }

  a:link {
    color: blue;
    text-decoration: none;
  }
  a:visited {
    color: rebeccapurple;
  }

  dd,
  ul {
    margin-left: 0;
    padding-left: 25px;
  }
`;

const styles = {
  heading: {
    margin: '0.8em 0',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontSize: '5em'
  },
  subheading: {
    fontSize: '1.6em'
  },
  example: {
    textAlign: 'center',
    backgroundColor: '#eee',
    margin: '2em 0',
    padding: '5px 0'
  }
};

function AboutLogo({ children }) {
  return <div css={{ textAlign: 'center', flex: '1' }}>{children}</div>;
}

function AboutLogoImage(props) {
  return <img {...props} css={{ maxWidth: '90%' }} />;
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
        {formatPercent(totals.requests.cached / totals.requests.all, 2)}%
      </strong>{' '}
      of which were served from the cache.
    </p>
  );
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { stats: null };

    if (typeof window === 'object' && window.localStorage) {
      const savedStats = window.localStorage.savedStats;

      if (savedStats) {
        this.state.stats = JSON.parse(savedStats);
      }

      window.onbeforeunload = () => {
        window.localStorage.savedStats = JSON.stringify(this.state.stats);
      };
    }
  }

  componentDidMount() {
    // Refresh latest stats.
    fetch('/api/stats?period=last-month')
      .then(res => res.json())
      .then(stats => this.setState({ stats }));
  }

  render() {
    const { stats } = this.state;
    const hasStats = !!(stats && !stats.error);

    return (
      <div css={{ maxWidth: 700, margin: '0 auto' }}>
        <Global styles={globalStyles} />

        <header>
          <h1 css={styles.heading}>unpkg</h1>

          <p>
            unpkg is a fast, global{' '}
            <a href="https://en.wikipedia.org/wiki/Content_delivery_network">
              content delivery network
            </a>{' '}
            for everything on <a href="https://www.npmjs.com/">npm</a>. Use it
            to quickly and easily load any file from any package using a URL
            like:
          </p>

          <div css={styles.example}>unpkg.com/:package@:version/:file</div>

          {hasStats && <Stats data={stats} />}
        </header>

        <h3 css={styles.subheading} id="examples">
          Examples
        </h3>

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

        <h3 css={styles.subheading} id="query-params">
          Query Parameters
        </h3>

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

        <h3 css={styles.subheading} id="cache-behavior">
          Cache Behavior
        </h3>

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

        <h3 css={styles.subheading} id="workflow">
          Workflow
        </h3>

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

        <h3 css={styles.subheading} id="about">
          About
        </h3>

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
          The unpkg CDN is powered by{' '}
          <a href="https://www.cloudflare.com">Cloudflare</a>, one of the
          world&apos;s largest and fastest cloud network platforms.{' '}
          {hasStats && (
            <span>
              In the past month, Cloudflare served over{' '}
              <strong>{formatBytes(stats.totals.bandwidth.all)}</strong> to{' '}
              <strong>{formatNumber(stats.totals.uniques.all)}</strong> unique
              unpkg users all over the world.
            </span>
          )}
        </p>

        <div
          css={{
            margin: '4em 0',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <AboutLogo>
            <a href="https://www.cloudflare.com">
              <AboutLogoImage src={cloudflareLogo} height="100" />
            </a>
          </AboutLogo>
        </div>

        <p>
          The origin servers for unpkg are powered by{' '}
          <a href="https://cloud.google.com/">Google Cloud</a> and made possible
          by a generous donation from the{' '}
          <a href="https://angular.io">Angular web framework</a>, one of the
          world&apos;s most popular libraries for building incredible user
          experiences on both desktop and mobile.
        </p>

        <div
          css={{
            margin: '4em 0 0',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <AboutLogo>
            <a href="https://angular.io">
              <AboutLogoImage src={angularLogo} width="200" />
            </a>
          </AboutLogo>
        </div>

        <footer
          css={{
            marginTop: '10em',
            color: '#aaa'
          }}
        >
          <p css={{ textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} unpkg &nbsp;&mdash;&nbsp; powered
            by{' '}
            <a href="https://cloud.google.com/">
              <img
                src={googleCloudLogo}
                height="32"
                css={{
                  verticalAlign: 'middle',
                  marginTop: -2,
                  marginLeft: -10
                }}
              />
            </a>
          </p>
        </footer>
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
