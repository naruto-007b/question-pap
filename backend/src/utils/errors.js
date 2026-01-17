class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message || 'Validation Error', 400);
    this.code = 'VALIDATION_ERROR';
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message || 'Authentication failed', 401);
    this.code = 'AUTHENTICATION_ERROR';
  }
}

class AuthorizationError extends AppError {
  constructor(message) {
    super(message || 'Not authorized to access this resource', 403);
    this.code = 'AUTHORIZATION_ERROR';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource not found', 404);
    this.code = 'NOT_FOUND_ERROR';
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message || 'Resource already exists', 409);
    this.code = 'CONFLICT_ERROR';
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};
