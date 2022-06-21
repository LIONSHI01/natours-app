const fs = require('fs');

//KEYNOTE Preload(synchronously->readFileSync()) JSON file into Javascript format with JSON.parse()

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// NOTE: Create middleware to check if ID valid, if invalid, it will return fail message to client without go to next()
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is : ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  // NOTE: convert string to integer
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({ status: 'success', data: { tour } });
};

exports.createTour = (req, res) => {
  // NOTE: newId: use the latest tour id + 1 (since some tour may be deleted, so total tour number != id number)
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>', // send updated tour
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
