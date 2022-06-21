const fs = require('fs');
const express = require('express');

const app = express();

// KEYNOTE: use Middleware to read POST JSON data from Clients
app.use(express.json());

//KEYNOTE Preload(synchronously->readFileSync()) JSON file into Javascript format with JSON.parse()
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/////////////ROUTING FUNCTION/////////////////
const getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', result: tours.length, data: { tours } });
};

const getTour = (req, res) => {
  // NOTE: convert string to integer
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (tour) res.status(200).json({ status: 'success', data: { tour } });
  if (!tour) res.status(404).json({ status: 'fail', message: 'Invalid ID' });
};

const createTour = (req, res) => {
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
};

const updateTour = (req, res) => {
  // Check if ID valid (NOT Official)
  if (req.params.id > tours.length)
    res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>', // send updated tour
    },
  });
};

const deleteTour = (req, res) => {
  // Check if ID valid (NOT Official)
  if (req.params.id > tours.length)
    res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

////////////////////////////////////////////////

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// NOTE: specify v1 for later update to v2, client could still use v1
app.route('/api/v1/tours').get(getAllTours).post(createTour);
// Respond to URL Parameters
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
