const express = require('express');

const router = express.Router();

const inventoryController = require('../controllers/inventory');
const passportConfig = require('../lib/passport');

router.get('/trackinglist',
  passportConfig.isAuthenticated,
  inventoryController.getProductTracker);

router.get('/trackinglist/:id',
  passportConfig.isAuthenticated,
  inventoryController.getProductTrackerInfo);

router.get('/trackinglist/:id/:id2',
  passportConfig.isAuthenticated,
  inventoryController.getProductTrackIndividualStatus);
router.post('/trackinglist/:id',
  passportConfig.isAuthenticated,
  inventoryController.getProductTrackIndividualStatus);
router.get('/trackinglistallverified/:id',
  passportConfig.isAuthenticated,
  inventoryController.getAllVerified);

router.post('/trackerissues/:id',
  passportConfig.isAuthenticated,
  inventoryController.postTrackerIssues);

module.exports = router;
