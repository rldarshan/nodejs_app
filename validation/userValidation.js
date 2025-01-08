const { check } = require('express-validator');

exports.validateUser = [
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.validateUserUpdate = [
  check('name').optional().not().isEmpty().withMessage('Name cannot be empty'),
  check('email').optional().isEmail().withMessage('Valid email is required'),
  check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];