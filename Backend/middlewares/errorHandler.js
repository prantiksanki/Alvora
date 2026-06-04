const errorHandler = (err, req, res, next) => {
  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)[0]?.message || 'Validation failed';
    return res.status(400).json({ message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }

  // Mongoose connection / buffering errors
  if (err.name === 'MongooseError' || err.name === 'MongoServerError') {
    return res.status(503).json({ message: 'Database unavailable. Please try again.' });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
