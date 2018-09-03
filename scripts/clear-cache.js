const cache = require("../modules/utils/cache");

function getKeys(client, pattern, callback, array = [], cursor = 0) {
  client.scan(cursor, "MATCH", pattern, (error, reply) => {
    if (error) {
      reject(error);
    } else {
      const next = reply[0];
      const keys = reply[1];

      array.push.apply(array, keys);

      if (next == 0) {
        callback(array);
      } else {
        getKeys(client, pattern, callback, array, next);
      }
    }
  });
}

getKeys(cache, "npmPackageInfo-*", keys => {
  console.log(keys);
  process.exit();
});
