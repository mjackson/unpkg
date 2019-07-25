/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FaTwitter, FaGithub } from 'react-icons/fa';

function createIcon(Type, { css, ...rest }) {
  return <Type css={{ ...css, verticalAlign: 'text-bottom' }} {...rest} />;
}

export function TwitterIcon(props) {
  return createIcon(FaTwitter, props);
}

export function GitHubIcon(props) {
  return createIcon(FaGithub, props);
}
