const createNamespace = require('cls-hooked').createNamespace
const ns = createNamespace('_express_request_local_storage')
const AsyncLock = require('async-lock')

exports = module.exports = {}

function getMeta () {
  return ns.get('_meta')
}

async function withLock (callback) {
  const meta = getMeta()
  return meta.lock.acquire('key', callback)
}

async function incrDecrNumber (key, count, valueCb) {
  if (count === undefined) {
    count = 1
  } else {
    // This else block is for test coverage
  }

  const meta = getMeta()

  return withLock(() => {
    const kv = meta.kv

    let value = kv[key]

    // Assume we want to initialize the counter
    if (value === undefined) {
      value = 0
    }

    if (typeof value !== 'number') {
      const type = typeof value
      throw new Error(`Counter is not a number, was '${type}'`)
    }

    value = valueCb(value, count)

    kv[key] = value
  })
}

/**
 * Create a new context and run callback
 *
 * @param {function} callback - Async callback
 * @returns {object} Result from callback
 */
exports.run = async function (callback) {
  return ns.runAndReturn(async () => {
    // Wrap all set/get operations using this meta object
    // This is so we can do proper locking
    ns.set('_meta', {
      'kv': {}, // Key/value storage
      'lock': new AsyncLock()
    })

    return callback()
  })
}

/**
 * Get storage object
 *
 * @param {String} key - Storage key
 * @returns {object} Stored object
 */
exports.get = async function (key) {
  return withLock(async () => {
    return getMeta().kv[key]
  })
}

/**
 * Set storage object
 *
 * @param {String} key - Storage key
 * @param {object} value - Storage key
 * @returns {object} Stored object
 */
exports.set = async function (key, value) {
  return withLock(async () => {
    const meta = getMeta()

    meta.kv[key] = value
  })
}

/**
 * Delete storage object
 *
 * @param {String} key - Storage key
 * @returns {undefined}
 */
exports.delete = async function (key) {
  return withLock(async () => {
    const meta = getMeta()

    delete meta.kv[key]
  })
}

/**
 * Update storage from a map
 *
 * @param {object} obj - KV mapping object
 * @returns {object} Stored object
 */
exports.update = function (obj) {
  const meta = getMeta()

  return withLock(async () => {
    const kv = meta.kv

    Object.keys(obj).forEach((key) => {
      kv[key] = obj[key]
    })
  })
}

/**
 * Atomically increment a counter
 *
 * @param {object} key - Storage key
 * @param {object} count - Increment by count
 * @returns {undefined}
 */
exports.incr = async function (key, count) {
  return incrDecrNumber(key, count, (value, count) => {
    return value + count
  })
}

/**
 * Atomically decrement a counter
 *
 * @param {object} key - Storage key
 * @param {object} count - Decrement by count
 * @returns {undefined}
 */
exports.decr = async function (key, count) {
  return incrDecrNumber(key, count, (value, count) => {
    return value - count
  })
}
