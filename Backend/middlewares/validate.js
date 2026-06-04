const { validationResult } = require('express-validator');

/**
 * Middleware factory — wraps express-validator chains.
 * Usage: router.post('/signup', validate([body('email').isEmail(), ...]), controller)
 */
const validate = (schemas) => [
  ...schemas,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

module.exports = validate;
