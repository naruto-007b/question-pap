const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 * @example
 * curl -X POST http://localhost:5000/api/auth/signup \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@example.com", "password":"password123"}'
 */
router.post('/signup', authController.signup);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 * @example
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@example.com", "password":"password123"}'
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/validate
 * @desc Validate token and get user data
 * @access Private
 * @example
 * curl -X POST http://localhost:5000/api/auth/validate \
 *   -H "Authorization: Bearer <token>"
 */
router.post('/validate', verifyToken, authController.validate);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (stateless)
 * @access Private
 * @example
 * curl -X POST http://localhost:5000/api/auth/logout \
 *   -H "Authorization: Bearer <token>"
 */
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
