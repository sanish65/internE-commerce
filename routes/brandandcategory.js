const express = require('express');

const router = express.Router();

const brandandcategoryController = require('../controllers/brandandcategory');
const passportConfig = require('../lib/passport');

const uploadController = require('../controllers/upload');

router.get('/addbrand',
  passportConfig.isAuthenticated,
  brandandcategoryController.getAddBrandForm);
router.post('/addbrand',
  passportConfig.isAuthenticated,
  uploadController.multipleUpload,
  brandandcategoryController.postBrandForm);
router.get('/brandlist',
  passportConfig.isAuthenticated,
  brandandcategoryController.getBrandsList);
router.get('/categorylist',
  passportConfig.isAuthenticated,
  brandandcategoryController.getCategoryList);
router.get('/addcategory',
  passportConfig.isAuthenticated,
  brandandcategoryController.getAddCategoryForm);
router.post('/addcategory',
  passportConfig.isAuthenticated,
  uploadController.multipleUpload,
  brandandcategoryController.postAddCategoryForm);
router.post('/categorylist/:id',
  passportConfig.isAuthenticated,

  uploadController.multipleUpload,
  brandandcategoryController.postAddCategoryForm);
router.get('/categorylist/:id',
  passportConfig.isAuthenticated,
  brandandcategoryController.getEditCategory);
router.post('/brandlist/:id',
  passportConfig.isAuthenticated,
  uploadController.multipleUpload,
  brandandcategoryController.postBrandForm);
router.get('/brandlist/:id',
  passportConfig.isAuthenticated,
  brandandcategoryController.getEditBrand);
module.exports = router;
