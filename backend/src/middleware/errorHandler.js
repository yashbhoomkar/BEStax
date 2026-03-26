function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const response = {
    message: error.message || "Internal server error."
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
