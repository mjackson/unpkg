/** @jsx jsx */
import { jsx } from '@emotion/core';
import { GoFileDirectory, GoFile } from 'react-icons/go';
import { FaTwitter, FaGithub } from 'react-icons/fa';

function createIcon(Type, { css, ...rest }) {
  return <Type css={{ ...css, verticalAlign: 'text-bottom' }} {...rest} />;
}

export function DirectoryIcon(props) {
  return createIcon(GoFileDirectory, props);
}

export function CodeFileIcon(props) {
  return createIcon(GoFile, props);
}

export function TwitterIcon(props) {
  return createIcon(FaTwitter, props);
}

export function GitHubIcon(props) {
  return createIcon(FaGithub, props);
}
