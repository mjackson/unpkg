/** @jsx jsx */
import { Global, css, jsx } from '@emotion/core';
import { Fragment } from 'react';
import PropTypes from 'prop-types';

import { fontSans, fontMono } from '../utils/style.js';

import { PackageInfoProvider } from './PackageInfo.js';
import DirectoryViewer from './DirectoryViewer.js';
import FileViewer from './FileViewer.js';
import { TwitterIcon, GitHubIcon } from './Icons.js';

import SelectDownArrow from './images/SelectDownArrow.png';

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

const linkStyle = {
  color: '#0076ff',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
};

export default function App({
  packageName,
  packageVersion,
  availableVersions = [],
  filename,
  target
}) {
  function handleChange(event) {
    window.location.href = window.location.href.replace(
      '@' + packageVersion,
      '@' + event.target.value
    );
  }

  const breadcrumbs = [];

  if (filename === '/') {
    breadcrumbs.push(packageName);
  } else {
    let url = `/browse/${packageName}@${packageVersion}`;

    breadcrumbs.push(
      <a href={`${url}/`} css={linkStyle}>
        {packageName}
      </a>
    );

    const segments = filename
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .split('/');

    const lastSegment = segments.pop();

    segments.forEach(segment => {
      url += `/${segment}`;
      breadcrumbs.push(
        <a href={`${url}/`} css={linkStyle}>
          {segment}
        </a>
      );
    });

    breadcrumbs.push(lastSegment);
  }

  // TODO: Provide a user pref to go full width?
  const maxContentWidth = 940;

  return (
    <PackageInfoProvider
      packageName={packageName}
      packageVersion={packageVersion}
    >
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
            <header css={{ textAlign: 'center' }}>
              <h1 css={{ fontSize: '3rem', marginTop: '2rem' }}>
                <a href="/" css={{ color: '#000', textDecoration: 'none' }}>
                  UNPKG
                </a>
              </h1>
              {/*
              <nav>
                <a href="#" css={{ ...linkStyle, color: '#c400ff' }}>
                  Become a Sponsor
                </a>
              </nav>
              */}
            </header>

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
              <h1 css={{ fontSize: '1.5rem', fontWeight: 'normal', flex: 1 }}>
                <nav>
                  {breadcrumbs.map((item, index, array) => (
                    <span key={index}>
                      {index !== 0 && (
                        <span css={{ paddingLeft: 5, paddingRight: 5 }}>/</span>
                      )}
                      {index === array.length - 1 ? (
                        <strong>{item}</strong>
                      ) : (
                        item
                      )}
                    </span>
                  ))}
                </nav>
              </h1>
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
            </header>
          </div>

          <div
            css={{
              maxWidth: maxContentWidth,
              padding: '0 20px',
              margin: '0 auto',
              '@media (max-width: 700px)': {
                padding: 0,
                margin: 0
              }
            }}
          >
            {target.type === 'directory' ? (
              <DirectoryViewer path={target.path} details={target.details} />
            ) : target.type === 'file' ? (
              <FileViewer path={target.path} details={target.details} />
            ) : null}
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
    </PackageInfoProvider>
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
