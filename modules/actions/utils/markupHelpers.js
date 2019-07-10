import { createElement } from 'react';

export { createElement };

export function createHTML(code) {
  return { __html: code };
}

export function createScript(script) {
  return createElement('script', {
    dangerouslySetInnerHTML: createHTML(script)
  });
}
