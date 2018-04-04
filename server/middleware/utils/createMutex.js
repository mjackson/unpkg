function createMutex(doWork) {
  const mutex = {};

  return (key, payload, callback) => {
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
