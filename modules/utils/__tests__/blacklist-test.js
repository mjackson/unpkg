import * as blacklist from '../blacklist';

describe('Blacklist API', () => {
  beforeEach(done => {
    blacklist.removeAllPackages().then(() => done(), done);
  });

  it('adds and removes packages to/from the blacklist', done => {
    const packageName = 'bad-package';

    blacklist.addPackage(packageName).then(() => {
      blacklist.getPackages().then(packageNames => {
        expect(packageNames).toEqual([packageName]);

        blacklist.removePackage(packageName).then(() => {
          blacklist.getPackages().then(packageNames => {
            expect(packageNames).toEqual([]);
            done();
          });
        });
      });
    });
  });
});
