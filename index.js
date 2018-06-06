'use strict'

const createNamespace = require('cls-hooked').createNamespace
const ns = createNamespace('_express_request_local_storage')
const AsyncLock = require('async-lock')

/**
 * @module node-rls
 */
exports = module.exports = {}

/**
 * Thrown when context has not yet been initialized
 *
 * @static
 * @param {string} message - Error message
 * @constructor
 * @type {Error}
 */
function NotInitializedError (message) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
}

function getMeta () {
  return ns.get('_meta')
}

async function withLock (callback) {
  const meta = getMeta()
  if (meta === undefined) {
    throw new exports.NotInitializedError('RLS context not initialized')
  }

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
    return value
  })
}

exports.NotInitializedError = NotInitializedError

/**
 * Create a new context and run callback.
 *
 * @async
 * @param {function} callback - Async callback
 * @returns {object} Result from callback
 * @example
 * // Any called function will have access to conext
 * // even async ones
 *
 * function func () {
 *   return RLS.get('requestid')
 * }
 *
 * RLS.run(async () => {
 *   const requestid = 'somerandomvalue'
 *   await RLS.set('requestid', requestid)
 *
 *   assert.strictEqual(await func(), requestid)
 * })
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
 * Get object from storage.
 *
 * @async
 * @param {String} key - Storage key
 * @returns {object} Stored object
 * @throws {NotInitializedError}
 */
exports.get = async function (key) {
  return withLock(async () => {
    return getMeta().kv[key]
  })
}

/**
 * Set storage object
 *
 * @async
 * @param {String} key - Storage key
 * @param {object} value - Storage key
 * @returns {undefined} Returns nothing
 * @throws {NotInitializedError}
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
 * @async
 * @param {String} key - Storage key
 * @returns {undefined} Returns nothing
 * @throws {NotInitializedError}
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
 * @async
 * @param {object} obj - KV mapping object
 * @returns {undefined} No return value
 * @throws {NotInitializedError}
 * @example
 * // Update storage with all values from object
 * const obj = {foo: 'bar', someKey: 'someValue'}
 * await update(obj)
 * console.log(await get('foo'))  // Prints bar
 */
exports.update = async function (obj) {
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
 * @async
 * @param {object} key - Storage key
 * @param {object} count - Increment by count
 * @throws {NotInitializedError}
 * @returns {Number} Counter after increment
 */
exports.incr = async function (key, count) {
  return incrDecrNumber(key, count, (value, count) => {
    return value + count
  })
}

/**
 * Atomically decrement a counter
 *
 * @async
 * @param {object} key - Storage key
 * @param {object} count - Decrement by count
 * @throws {NotInitializedError}
 * @returns {Number} Counter after decrement
 */
exports.decr = async function (key, count) {
  return incrDecrNumber(key, count, (value, count) => {
    return value - count
  })
}
