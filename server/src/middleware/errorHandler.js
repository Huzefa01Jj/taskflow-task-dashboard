
export default function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status =
    error.statusCode ||
    error.status ||
    500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: status >= 500
      ? "Internal server error."
      : error.message
  });
}
