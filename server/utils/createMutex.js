const invariant = require("invariant");

function defaultCreateKey(payload) {
  return payload;
}

function createMutex(doWork, createKey = defaultCreateKey) {
  const mutex = Object.create(null);

  return (payload, callback) => {
    const key = createKey(payload);

    invariant(
      typeof key === "string",
      "Mutex needs a string key; please provide a createKey function that returns a string"
    );

    if (mutex[key]) {
      mutex[key].push(callback);
    } else {
      mutex[key] = [callback];

      doWork(payload, (error, value) => {
        mutex[key].forEach(callback => {
          callback(error, value);
        });

        delete mutex[key];
      });
    }
  };
}

module.exports = createMutex;
