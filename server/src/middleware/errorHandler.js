const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  if (isServerError) {
    process.stderr.write(`${err.stack || err.message || err}\n`);
  }

  const message =
    isServerError && process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message || 'Something went wrong';

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };

