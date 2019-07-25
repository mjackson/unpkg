const writeFile = require('fs').writeFileSync;
const tempy = require('tempy');

function updateWatchfile(watchfile) {
  writeFile(watchfile, '' + Date.now());
}

function entryManifest() {
  let manifests = [];

  const watchfile = tempy.file();
  updateWatchfile(watchfile);

  return {
    /**
     * A Rollup plugin that populates the entry manifest. This should be
     * used in the client bundle where the code-splitting is taking place.
     */
    record(options = {}) {
      const publicPath = (options.publicPath || '/').replace(/\/*$/, '/');

      let manifest = Object.create(null);
      manifests.push(manifest);

      return {
        name: 'entry-manifest-record',
        buildStart() {
          for (const key in manifest) {
            delete manifest[key];
          }
        },
        generateBundle(options, bundle) {
          Object.keys(bundle).forEach(fileName => {
            const info = bundle[fileName];

            // We're interested only in entry points.
            if (!info.isEntry) return;

            const globalImports = info.imports.filter(
              name => options.globals && options.globals[name]
            );

            let entryPoints = manifest[info.name];

            if (!entryPoints) {
              entryPoints = manifest[info.name] = [];
            }

            entryPoints.push({
              format: options.format,
              globalImports: globalImports,
              url: publicPath + fileName,
              code: info.code
            });
          });

          updateWatchfile(watchfile);
        }
      };
    },

    /**
     * A Rollup plugin that provides the current entry manifest via a
     * virtual module id.
     */
    inject(options = {}) {
      const virtualId = options.virtualId || 'entry-manifest';

      return {
        name: 'entry-manifest-inject',
        resolveId(id) {
          if (id === virtualId) {
            return id;
          }
          return null;
        },
        load(id) {
          if (id === virtualId) {
            const value = manifests.length === 1 ? manifests[0] : manifests;
            return 'export default ' + JSON.stringify(value);
          }
          return null;
        },
        transform(code, id) {
          if (id === virtualId) {
            this.addWatchFile(watchfile);
          }
          return null;
        }
      };
    }
  };
}

module.exports = entryManifest;
