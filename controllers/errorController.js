// ERROR handling Middleware
module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500; // if there is no err.statusCode then default as 500
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
