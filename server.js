const mongoose = require('mongoose');
const dotenv = require('dotenv');

// To caught any Uncqught exceptio(synchronous code)n error before running the code
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION,🥶, Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
// NOTE: place below dotenv.config(), so read dotenv.config first
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// KEYNOTE: Connect MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Catch unhandled Promise Rejection(Asynchronous Code) GLOBALLY / Outside Express !! Final safy-net.
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION,🥶, Shutting down...');
  console.log(err.name, err.message);
  // Close the server first then the app, so let the server process all remaining requests (real world way)
  server.close(() => {
    process.exit(1); // 1 = Uncaught Exception , 0 = Success
  });
});
