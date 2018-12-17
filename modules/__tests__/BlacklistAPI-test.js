const BlacklistAPI = require('../BlacklistAPI');

describe('Blacklist API', () => {
  beforeEach(done => {
    BlacklistAPI.removeAllPackages().then(() => done(), done);
  });

  it('adds and removes packages to/from the blacklist', done => {
    const packageName = 'bad-package';

    BlacklistAPI.addPackage(packageName).then(() => {
      BlacklistAPI.getPackages().then(packageNames => {
        expect(packageNames).toEqual([packageName]);

        BlacklistAPI.removePackage(packageName).then(() => {
          BlacklistAPI.getPackages().then(packageNames => {
            expect(packageNames).toEqual([]);
            done();
          });
        });
      });
    });
  });
});
