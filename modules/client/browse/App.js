/** @jsx jsx */
import { Global, css, jsx } from '@emotion/core';
import { Fragment } from 'react';
import PropTypes from 'prop-types';

import { fontSans, fontMono } from '../utils/style.js';

import FolderViewer from './FolderViewer.js';
import FileViewer from './FileViewer.js';
import { TwitterIcon, GitHubIcon } from './Icons.js';

import SelectDownArrow from './images/SelectDownArrow.png';

const buildId = process.env.BUILD_ID;

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
    overflow-wrap: break-word;
    background: white;
    color: black;
  }

  code {
    ${fontMono}
  }

  th,
  td {
    padding: 0;
  }

  select {
    font-size: inherit;
  }

  #root {
    display: flex;
    flex-direction: column;
  }
`;

// Adapted from https://github.com/highlightjs/highlight.js/blob/master/src/styles/atom-one-light.css
const lightCodeStyles = css`
  .code-listing {
    background: #fbfdff;
    color: #383a42;
  }
  .code-comment,
  .code-quote {
    color: #a0a1a7;
    font-style: italic;
  }
  .code-doctag,
  .code-keyword,
  .code-link,
  .code-formula {
    color: #a626a4;
  }
  .code-section,
  .code-name,
  .code-selector-tag,
  .code-deletion,
  .code-subst {
    color: #e45649;
  }
  .code-literal {
    color: #0184bb;
  }
  .code-string,
  .code-regexp,
  .code-addition,
  .code-attribute,
  .code-meta-string {
    color: #50a14f;
  }
  .code-built_in,
  .code-class .code-title {
    color: #c18401;
  }
  .code-attr,
  .code-variable,
  .code-template-variable,
  .code-type,
  .code-selector-class,
  .code-selector-attr,
  .code-selector-pseudo,
  .code-number {
    color: #986801;
  }
  .code-symbol,
  .code-bullet,
  .code-meta,
  .code-selector-id,
  .code-title {
    color: #4078f2;
  }
  .code-emphasis {
    font-style: italic;
  }
  .code-strong {
    font-weight: bold;
  }
`;

function Link({ css, ...rest }) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...rest}
      css={{
        color: '#0076ff',
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        ...css
      }}
    />
  );
}

function AppHeader() {
  return (
    <header css={{ marginTop: '2rem' }}>
      <h1
        css={{
          textAlign: 'center',
          fontSize: '3rem',
          letterSpacing: '0.05em'
        }}
      >
        <a href="/" css={{ color: '#000', textDecoration: 'none' }}>
          UNPKG
        </a>
      </h1>
      {/*
        <nav>
          <Link href="#" css={{ color: '#c400ff' }}>
            Become a Sponsor
          </Link>
        </nav>
        */}
    </header>
  );
}

function AppNavigation({
  packageName,
  packageVersion,
  availableVersions,
  filename
}) {
  function handleVersionChange(nextVersion) {
    window.location.href = window.location.href.replace(
      '@' + packageVersion,
      '@' + nextVersion
    );
  }

  let breadcrumbs = [];

  if (filename === '/') {
    breadcrumbs.push(packageName);
  } else {
    let url = `/browse/${packageName}@${packageVersion}`;

    breadcrumbs.push(<Link href={`${url}/`}>{packageName}</Link>);

    let segments = filename
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .split('/');
    let lastSegment = segments.pop();

    segments.forEach(segment => {
      url += `/${segment}`;
      breadcrumbs.push(<Link href={`${url}/`}>{segment}</Link>);
    });

    breadcrumbs.push(lastSegment);
  }

  return (
    <header
      css={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        '@media (max-width: 700px)': {
          flexDirection: 'column-reverse',
          alignItems: 'flex-start'
        }
      }}
    >
      <h1
        css={{
          fontSize: '1.5rem',
          fontWeight: 'normal',
          flex: 1,
          wordBreak: 'break-all'
        }}
      >
        <nav>
          {breadcrumbs.map((item, index, array) => (
            <Fragment key={index}>
              {index !== 0 && (
                <span css={{ paddingLeft: 5, paddingRight: 5 }}>/</span>
              )}
              {index === array.length - 1 ? <strong>{item}</strong> : item}
            </Fragment>
          ))}
        </nav>
      </h1>
      <PackageVersionPicker
        packageVersion={packageVersion}
        availableVersions={availableVersions}
        onChange={handleVersionChange}
      />
    </header>
  );
}

function PackageVersionPicker({ packageVersion, availableVersions, onChange }) {
  function handleChange(event) {
    if (onChange) onChange(event.target.value);
  }

  return (
    <p
      css={{
        marginLeft: 20,
        '@media (max-width: 700px)': {
          marginLeft: 0,
          marginBottom: 0
        }
      }}
    >
      <label>
        Version:{' '}
        <select
          name="version"
          defaultValue={packageVersion}
          onChange={handleChange}
          css={{
            appearance: 'none',
            cursor: 'pointer',
            padding: '4px 24px 4px 8px',
            fontWeight: 600,
            fontSize: '0.9em',
            color: '#24292e',
            border: '1px solid rgba(27,31,35,.2)',
            borderRadius: 3,
            backgroundColor: '#eff3f6',
            backgroundImage: `url(${SelectDownArrow})`,
            backgroundPosition: 'right 8px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto 25%',
            ':hover': {
              backgroundColor: '#e6ebf1',
              borderColor: 'rgba(27,31,35,.35)'
            },
            ':active': {
              backgroundColor: '#e9ecef',
              borderColor: 'rgba(27,31,35,.35)',
              boxShadow: 'inset 0 0.15em 0.3em rgba(27,31,35,.15)'
            }
          }}
        >
          {availableVersions.map(v => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
    </p>
  );
}

function AppContent({ packageName, packageVersion, target }) {
  return target.type === 'directory' ? (
    <FolderViewer path={target.path} details={target.details} />
  ) : target.type === 'file' ? (
    <FileViewer
      packageName={packageName}
      packageVersion={packageVersion}
      path={target.path}
      details={target.details}
    />
  ) : null;
}

export default function App({
  packageName,
  packageVersion,
  availableVersions = [],
  filename,
  target
}) {
  let maxContentWidth = 940;
  // TODO: Make this changeable
  let isFullWidth = false;

  return (
    <Fragment>
      <Global styles={globalStyles} />
      <Global styles={lightCodeStyles} />

      <div css={{ flex: '1 0 auto' }}>
        <div
          css={{
            maxWidth: maxContentWidth,
            padding: '0 20px',
            margin: '0 auto'
          }}
        >
          <AppHeader />
        </div>
        <div
          css={{
            maxWidth: isFullWidth ? undefined : maxContentWidth,
            padding: '0 20px',
            margin: '0 auto'
          }}
        >
          <AppNavigation
            packageName={packageName}
            packageVersion={packageVersion}
            availableVersions={availableVersions}
            filename={filename}
          />
        </div>
        <div
          css={{
            maxWidth: isFullWidth ? undefined : maxContentWidth,
            padding: '0 20px',
            margin: '0 auto',
            '@media (max-width: 700px)': {
              padding: 0,
              margin: 0
            }
          }}
        >
          <AppContent
            packageName={packageName}
            packageVersion={packageVersion}
            target={target}
          />
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
            maxWidth: maxContentWidth,
            padding: '10px 20px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <p>
            <span>Build: {buildId}</span>
          </p>
          <p>
            <span>&copy; {new Date().getFullYear()} UNPKG</span>
          </p>
          <p css={{ fontSize: '1.5rem' }}>
            <a
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
              href="https://github.com/mjackson/unpkg"
              css={{
                color: '#aaa',
                display: 'inline-block',
                ':hover': { color: 'white' },
                marginLeft: '1rem'
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
  const targetType = PropTypes.shape({
    path: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['directory', 'file']).isRequired,
    details: PropTypes.object.isRequired
  });

  App.propTypes = {
    packageName: PropTypes.string.isRequired,
    packageVersion: PropTypes.string.isRequired,
    availableVersions: PropTypes.arrayOf(PropTypes.string),
    filename: PropTypes.string.isRequired,
    target: targetType.isRequired
  };
}
