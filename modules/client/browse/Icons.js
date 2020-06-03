/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  GoArrowBoth,
  GoFile,
  GoFileCode,
  GoFileDirectory
} from 'react-icons/go';
import { FaTwitter, FaGithub } from 'react-icons/fa';

function createIcon(Type, { css, ...rest }) {
  return <Type css={{ ...css, verticalAlign: 'text-bottom' }} {...rest} />;
}

export function FileIcon(props) {
  return createIcon(GoFile, props);
}

export function FileCodeIcon(props) {
  return createIcon(GoFileCode, props);
}

export function FolderIcon(props) {
  return createIcon(GoFileDirectory, props);
}

export function TwitterIcon(props) {
  return createIcon(FaTwitter, props);
}

export function GitHubIcon(props) {
  return createIcon(FaGithub, props);
}

export function ArrowBothIcon(props) {
  return createIcon(GoArrowBoth, props);
}
