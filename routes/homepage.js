const express = require('express');

const router = express.Router();

const dashboardController = require('../controllers/dashboard');
const categoriesController = require('../controllers/categories');

router.get('/faq',
  dashboardController.getFaq);

router.get('/product/:id',
  dashboardController.getProductDefinePage);

router.get('/brand',
  dashboardController.getBrandInfoPage);

router.get('/:id',
  dashboardController.getFeaturedInfo);

router.post('/categoryOptions/options',
  dashboardController.categoryOptions);

router.get('/categories/info',
  categoriesController.getCategories);

router.get('/definecategories/:id',
  categoriesController.getCategoriesProduct);

router.post('/rateStars/:id',
  dashboardController.getBrandRated);

router.post('/reviewproduct/:id',
  dashboardController.postProductReview);

router.post('/reviewbrand/:id',
  dashboardController.postBrandReview);

router.post('/rateStarsProduct/:id',
  dashboardController.getProductRated);

router.get('/branded/:id',
  dashboardController.getBrandedPage);

router.get('/brandinfo/:id',
  dashboardController.getBrandInfo);

router.post('/searchProduct',
  dashboardController.postSearchBar);

router.get('/search/searchAutoComplete',
  dashboardController.searchProductName,);

module.exports = router;
