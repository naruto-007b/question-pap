const authUtils = require('../utils/userService');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const { getUserById } = require('../db/queries');

/**
 * Middleware to verify JWT token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = authUtils.verifyToken(token);

    if (!decoded) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Optional: Verify user still exists in DB
    const user = await getUserById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory to restrict access based on user role
 * @param {string} role Required role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
