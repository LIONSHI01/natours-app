const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
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

// Catch unhandled Promise Rejection GLOBALLY!! Final safe net.
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION,🥶, Shutting down...');
  // Close the server first then the app, so let the server process all remaining requests in real world
  server.close(() => {
    process.exit(1); // 1 = Uncaught Exception , 0 = Success
  });
});
