const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');

const app = express();

// 1) MIDDLEWARE
app.use(morgan('dev'));

// KEYNOTE: use Middleware to read POST JSON data from Clients
app.use(express.json());

// KEYNOTE :(!!!ORDER matters) Create Middleware function to response request,Without specify Routing, it response to every request
app.use((req, res, next) => {
  console.log('Hello from the middleware 😎 ');
  // Call next() to complete cycle
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
