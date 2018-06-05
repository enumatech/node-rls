const RLS = require('./index.js')

/**
 * Create a new context in an express.js middleware
 *
 * @param {function} req - Express request
 * @param {function} res - Express response
 * @param {function} next - Express middleware
 * @returns {undefined}
 */
function express (req, res, next) {
  // Run next middleware in a context
  RLS.run(next)
}

exports = module.exports = {
  'express': express
}
