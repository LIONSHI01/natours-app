const express = require('express');
const fs = require('fs');
const router = express.Router();
const tourController = require('./../controllers/tourController');

router.param('id', tourController.checkID);
router.param('name', tourController.checkBody);
// router.param('id', tourController.checkBody);

// NOTE: specify v1 for later update to v2, client could still use v1
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);
// Respond to URL Parameters
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
