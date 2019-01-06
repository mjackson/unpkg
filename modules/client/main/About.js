import React from 'react';

import Wrapper from './Wrapper';

import cloudflareLogo from './CloudflareLogo.png';
import herokuLogo from './HerokuLogo.png';

const styles = {
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

export default function About() {
  return (
    <Wrapper>
      <p>
        unpkg is an <a href="https://github.com/unpkg">open source</a> project
        built and maintained by{' '}
        <a href="https://twitter.com/mjackson">Michael Jackson</a>.
      </p>

      <h3 id="sponsors">Sponsors</h3>
      <p>
        The fast, global infrastructure that powers unpkg is generously donated
        by <a href="https://www.cloudflare.com">Cloudflare</a> and{' '}
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

      <h3 id="abuse">Abuse</h3>
      <p>
        unpkg maintains a list of packages that are known to be malicious. If
        you find such a package on npm, please let us know!
      </p>

      <h3 id="support">Support</h3>
      <p>
        unpkg is not affiliated with or supported by npm, Inc. in any way.
        Please do not contact npm for help with unpkg. Instead, please reach out
        to <a href="https://twitter.com/unpkg">@unpkg</a> with any questions or
        concerns.
      </p>
    </Wrapper>
  );
}
