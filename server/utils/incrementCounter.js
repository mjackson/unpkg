const db = require("./redis");

function incrementCounter(counter, key, by = 1) {
  return new Promise((resolve, reject) => {
    db.hincrby(counter, key, by, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

module.exports = incrementCounter;
