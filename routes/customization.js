const express = require('express');

const router = express.Router();
const customizationController = require('../controllers/customization');
const passportConfig = require('../lib/passport');
const uploadController = require('../controllers/upload');

router.get('/addbanner',
  passportConfig.isAuthenticated,
  customizationController.getAddBanner);

router.post('/addBanner',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  uploadController.multipleUpload,
  customizationController.postAddBanner);

router.get('/listbanner',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  customizationController.getListBanner);

router.post('/addLogos',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  uploadController.multipleUpload,
  customizationController.postLogos);

router.get('/editbanner/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  customizationController.getEditBanner);

router.post('/addBanner/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  uploadController.multipleUpload,
  customizationController.postAddBanner);

router.get('/usebanner/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  customizationController.getBannerUse);

router.get('/uselogo/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  customizationController.getBannerUse);
module.exports = router;
