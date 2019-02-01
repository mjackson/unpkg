import createSearch from '../createSearch';

describe('createSearch', () => {
  it('omits the trailing = for empty string values', () => {
    expect(createSearch({ a: 'a', b: '' })).toEqual('?a=a&b');
  });

  it('sorts keys', () => {
    expect(createSearch({ b: 'b', a: 'a', c: 'c' })).toEqual('?a=a&b=b&c=c');
  });

  it('returns an empty string when there are no params', () => {
    expect(createSearch({})).toEqual('');
  });
});
