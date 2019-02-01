import createElement from './createElement';
import createHTML from './createHTML';

export default function createScript(script) {
  return createElement('script', {
    dangerouslySetInnerHTML: createHTML(script)
  });
}
