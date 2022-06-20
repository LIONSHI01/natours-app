const fs = require('fs');
const express = require('express');

const app = express();

// KEYNOTE: use Middleware to read POST JSON data from Clients
app.use(express.json());

//KEYNOTE Preload(synchronously->readFileSync()) JSON file into Javascript format with JSON.parse()
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// NOTE: specify v1 for later update to v2, client could still use v1
app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', result: tours.length, data: { tours } });
});

// Respond to URL Parameters
app.get('/api/v1/tours/:id', (req, res) => {
  // NOTE: convert string to integer
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (tour) res.status(200).json({ status: 'success', data: { tour } });
  if (!tour) res.status(404).json({ status: 'fail', message: 'Invalid ID' });
});

app.post('/api/v1/tours', (req, res) => {
  // NOTE: newId: use the latest tour id + 1 (since some tour may be deleted, so total tour number != id number)
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // NOTE: status = 201 => means Created new status
      res.status(201).json({
        status: 'success',
        data: { tour: newTour },
      });
    }
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
