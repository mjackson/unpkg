import { createElement } from 'react';

export function createHTML(content) {
  return { __html: content };
}

export function createScript(script) {
  return createElement('script', {
    dangerouslySetInnerHTML: createHTML(script)
  });
}
