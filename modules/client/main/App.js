/** @jsx jsx */
import { Global, css, jsx } from '@emotion/core';
import { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import formatBytes from 'pretty-bytes';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';

import { formatNumber, formatPercent } from '../utils/format.js';
import { fontSans, fontMono } from '../utils/style.js';

import { TwitterIcon, GitHubIcon } from './Icons.js';
import CloudflareLogo from './images/CloudflareLogo.png';
import AngularLogo from './images/AngularLogo.png';

const globalStyles = css`
  html {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  html,
  body,
  #root {
    height: 100%;
    margin: 0;
  }

  body {
    ${fontSans}
    font-size: 16px;
    line-height: 1.5;
    background: white;
    color: black;
  }

  code {
    ${fontMono}
  }

  dd,
  ul {
    margin-left: 0;
    padding-left: 25px;
  }

  #root {
    display: flex;
    flex-direction: column;
  }
`;

const linkStyle = {
  color: '#0076ff',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
};

function AboutLogo({ children }) {
  return <div css={{ textAlign: 'center', flex: '1' }}>{children}</div>;
}

function AboutLogoImage(props) {
  /* eslint-disable-next-line jsx-a11y/alt-text */
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

export default function App() {
  const [stats, setStats] = useState(
    typeof window === 'object' &&
      window.localStorage &&
      window.localStorage.savedStats
      ? JSON.parse(window.localStorage.savedStats)
      : null
  );
  const hasStats = !!(stats && !stats.error);
  const stringStats = JSON.stringify(stats);

  useEffect(() => {
    window.localStorage.savedStats = stringStats;
  }, [stringStats]);

  useEffect(() => {
    fetch('/api/stats?period=last-month')
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <Fragment>
      <div
        css={{
          maxWidth: 740,
          margin: '0 auto',
          padding: '0 20px'
        }}
      >
        <Global styles={globalStyles} />

        <header>
          <h1
            css={{
              textTransform: 'uppercase',
              textAlign: 'center',
              fontSize: '5em'
            }}
          >
            unpkg
          </h1>

          <p>
            unpkg is a fast, global content delivery network for everything on{' '}
            <a href="https://www.npmjs.com/" css={linkStyle}>
              npm
            </a>
            . Use it to quickly and easily load any file from any package using
            a URL like:
          </p>

          <div
            css={{
              textAlign: 'center',
              backgroundColor: '#eee',
              margin: '2em 0',
              padding: '5px 0'
            }}
          >
            unpkg.com/:package@:version/:file
          </div>

          {hasStats && <Stats data={stats} />}
        </header>

        <h3 css={{ fontSize: '1.6em' }} id="examples">
          Examples
        </h3>

        <p>Using a fixed version:</p>

        <ul>
          <li>
            <a
              title="react.production.min.js"
              href="/react@16.7.0/umd/react.production.min.js"
              css={linkStyle}
            >
              unpkg.com/react@16.7.0/umd/react.production.min.js
            </a>
          </li>
          <li>
            <a
              title="react-dom.production.min.js"
              href="/react-dom@16.7.0/umd/react-dom.production.min.js"
              css={linkStyle}
            >
              unpkg.com/react-dom@16.7.0/umd/react-dom.production.min.js
            </a>
          </li>
        </ul>

        <p>
          You may also use a{' '}
          <a
            title="semver"
            href="https://docs.npmjs.com/misc/semver"
            css={linkStyle}
          >
            semver range
          </a>{' '}
          or a{' '}
          <a
            title="tags"
            href="https://docs.npmjs.com/cli/dist-tag"
            css={linkStyle}
          >
            tag
          </a>{' '}
          instead of a fixed version number, or omit the version/tag entirely to
          use the <code>latest</code> tag.
        </p>

        <ul>
          <li>
            <a
              title="react.production.min.js"
              href="/react@^16/umd/react.production.min.js"
              css={linkStyle}
            >
              unpkg.com/react@^16/umd/react.production.min.js
            </a>
          </li>
          <li>
            <a
              title="react.production.min.js"
              href="/react/umd/react.production.min.js"
              css={linkStyle}
            >
              unpkg.com/react/umd/react.production.min.js
            </a>
          </li>
        </ul>

        <p>
          If you omit the file path (i.e. use a &ldquo;bare&rdquo; URL), unpkg
          will serve the file specified by the <code>unpkg</code> field in{' '}
          <code>package.json</code>, or fall back to <code>main</code>.
        </p>

        <ul>
          <li>
            <a title="jQuery" href="/jquery" css={linkStyle}>
              unpkg.com/jquery
            </a>
          </li>
          <li>
            <a title="Three.js" href="/three" css={linkStyle}>
              unpkg.com/three
            </a>
          </li>
        </ul>

        <p>
          Append a <code>/</code> at the end of a URL to view a listing of all
          the files in a package.
        </p>

        <ul>
          <li>
            <a
              title="Index of the react package"
              href="/react/"
              css={linkStyle}
            >
              unpkg.com/react/
            </a>
          </li>
          <li>
            <a
              title="Index of the react-router package"
              href="/react-router/"
              css={linkStyle}
            >
              unpkg.com/react-router/
            </a>
          </li>
        </ul>

        <h3 css={{ fontSize: '1.6em' }} id="query-params">
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
            <a
              title="bare import specifiers"
              href="https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier"
              css={linkStyle}
            >
              &ldquo;bare&rdquo; <code>import</code> specifiers
            </a>{' '}
            in JavaScript modules to unpkg URLs. This feature is{' '}
            <em>very experimental</em>
          </dd>
        </dl>

        <h3 css={{ fontSize: '1.6em' }} id="cache-behavior">
          Cache Behavior
        </h3>

        <p>
          The CDN caches files based on their permanent URL, which includes the
          npm package version. This works because npm does not allow package
          authors to overwrite a package that has already been published with a
          different one at the same version number.
        </p>
        <p>
          Browsers are instructed (via the <code>Cache-Control</code> header) to
          cache assets indefinitely (1 year).
        </p>
        <p>
          URLs that do not specify a package version number redirect to one that
          does. This is the <code>latest</code> version when no version is
          specified, or the <code>maxSatisfying</code> version when a{' '}
          <a
            title="semver"
            href="https://github.com/npm/node-semver"
            css={linkStyle}
          >
            semver version
          </a>{' '}
          is given. Redirects are cached for 10 minutes at the CDN, 1 minute in
          browsers.
        </p>
        <p>
          If you want users to be able to use the latest version when you cut a
          new release, the best policy is to put the version number in the URL
          directly in your installation instructions. This will also load more
          quickly because we won&apos;t have to resolve the latest version and
          redirect them.
        </p>

        <h3 css={{ fontSize: '1.6em' }} id="workflow">
          Workflow
        </h3>

        <p>
          For npm package authors, unpkg relieves the burden of publishing your
          code to a CDN in addition to the npm registry. All you need to do is
          include your{' '}
          <a title="UMD" href="https://github.com/umdjs/umd" css={linkStyle}>
            UMD
          </a>{' '}
          build in your npm package (not your repo, that&apos;s different!).
        </p>

        <p>You can do this easily using the following setup:</p>

        <ul>
          <li>
            Add the <code>umd</code> (or <code>dist</code>) directory to your{' '}
            <code>.gitignore</code> file
          </li>
          <li>
            Add the <code>umd</code> directory to your{' '}
            <a
              title="package.json files array"
              href="https://docs.npmjs.com/files/package.json#files"
              css={linkStyle}
            >
              files array
            </a>{' '}
            in <code>package.json</code>
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

        <h3 css={{ fontSize: '1.6em' }} id="about">
          About
        </h3>

        <p>
          unpkg is an{' '}
          <a
            title="unpkg on GitHub"
            href="https://github.com/unpkg"
            css={linkStyle}
          >
            open source
          </a>{' '}
          project built and maintained by{' '}
          <a
            title="mjackson on Twitter"
            href="https://twitter.com/mjackson"
            css={linkStyle}
          >
            Michael Jackson
          </a>
          . unpkg is not affiliated with or supported by npm, Inc. in any way.
          Please do not contact npm for help with unpkg. Instead, please reach
          out to{' '}
          <a
            title="unpkg on Twitter"
            href="https://twitter.com/unpkg"
            css={linkStyle}
          >
            @unpkg
          </a>{' '}
          with any questions or concerns.
        </p>

        <p>
          The unpkg CDN is powered by{' '}
          <a
            title="Cloudflare"
            href="https://www.cloudflare.com"
            css={linkStyle}
          >
            Cloudflare
          </a>
          , one of the world&apos;s largest and fastest cloud network platforms.{' '}
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
            <a title="Cloudflare" href="https://www.cloudflare.com">
              <AboutLogoImage
                alt="Cloudflare"
                src={CloudflareLogo}
                height="100"
              />
            </a>
          </AboutLogo>
        </div>

        <p>
          The origin servers for unpkg are powered by{' '}
          <a
            title="Google Cloud"
            href="https://cloud.google.com/"
            css={linkStyle}
          >
            Google Cloud
          </a>{' '}
          and made possible by a generous donation from the{' '}
          <a title="Angular" href="https://angular.io" css={linkStyle}>
            Angular web framework
          </a>
          , one of the world&apos;s most popular libraries for building
          incredible user experiences on both desktop and mobile.
        </p>

        <div
          css={{
            margin: '4em 0 0',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <AboutLogo>
            <a title="Angular" href="https://angular.io">
              <AboutLogoImage alt="Angular" src={AngularLogo} width="200" />
            </a>
          </AboutLogo>
        </div>
      </div>

      <footer
        css={{
          marginTop: '5rem',
          background: 'black',
          color: '#aaa'
        }}
      >
        <div
          css={{
            maxWidth: 740,
            padding: '10px 20px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <p>&copy; {new Date().getFullYear()} UNPKG</p>
          <p css={{ fontSize: '1.5rem' }}>
            <a
              title="Twitter"
              href="https://twitter.com/unpkg"
              css={{
                color: '#aaa',
                display: 'inline-block',
                ':hover': { color: 'white' }
              }}
            >
              <TwitterIcon />
            </a>
            <a
              title="GitHub"
              href="https://github.com/mjackson/unpkg"
              css={{
                color: '#aaa',
                display: 'inline-block',
                marginLeft: '1rem',
                ':hover': { color: 'white' }
              }}
            >
              <GitHubIcon />
            </a>
          </p>
        </div>
      </footer>
    </Fragment>
  );
}

if (process.env.NODE_ENV !== 'production') {
  App.propTypes = {
    location: PropTypes.object,
    children: PropTypes.node
  };
}
