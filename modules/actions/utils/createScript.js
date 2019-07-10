import createElement from './createElement.js';
import createHTML from './createHTML.js';

export default function createScript(script) {
  return createElement('script', {
    dangerouslySetInnerHTML: createHTML(script)
  });
}
