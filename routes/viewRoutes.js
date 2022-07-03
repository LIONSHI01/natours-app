const express = require('express');
const viewController = require('../controllers/viewsController');

const router = express.Router();

router.get('/', viewController.getOverview);

router.route('/tour/:slug').get(viewController.getTour);

module.exports = router;
