const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', viewController.getOverview);

router.route('/tour/:slug').get(authController.protect, viewController.getTour);

router.get('/login', viewController.getLoginForm);

module.exports = router;
