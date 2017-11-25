const db = require("./RedisClient")

const BlacklistSet = "blacklisted-packages"

function addPackage(packageName) {
  return new Promise((resolve, reject) => {
    db.sadd(BlacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(value === 1)
      }
    })
  })
}

function removePackage(packageName) {
  return new Promise((resolve, reject) => {
    db.srem(BlacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(value === 1)
      }
    })
  })
}

function removeAllPackages() {
  return new Promise((resolve, reject) => {
    db.del(BlacklistSet, error => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

function getPackages() {
  return new Promise((resolve, reject) => {
    db.smembers(BlacklistSet, (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(value)
      }
    })
  })
}

function includesPackage(packageName) {
  return new Promise((resolve, reject) => {
    db.sismember(BlacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(value === 1)
      }
    })
  })
}

module.exports = {
  addPackage,
  removePackage,
  removeAllPackages,
  getPackages,
  includesPackage
}
