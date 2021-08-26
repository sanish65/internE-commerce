const express = require('express');

const router = express.Router();

const app = express();
const purchaseController = require('../controllers/purchase');
const inventoryController = require('../controllers/inventory');
const preorderPurchaseController = require('../controllers/preorderpurchase');
const uploadController = require('../controllers/upload');
const passportConfig = require('../lib/passport');

router.get('/addpurchase',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.getAddPurchase);
router.post('/addpurchase/',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.postPurchaseForms);
router.get('/purchaselist',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.getPurchaseList);
router.get('/purchaselist/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.getEditPurchase);
router.get('/purchaseDetails/:prodid/:purchid/:prodname/:prodcount/:prodcost',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.purchaseDetails);
router.post('/purchaselist/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.updatePurchaseForm);

router.post('/addpurchase/',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.getSearchInventory);

router.get('/addpurchase/searchinventory',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  purchaseController.getSearchProducts);

//= ============= Calculator =============
router.get('/calculator',
  passportConfig.isAuthenticated,
  purchaseController.getCalculator);
router.post('/calculator',
  passportConfig.isAuthenticated,
  purchaseController.postCalculator);

//= =============  =============

router.get('/addinventory',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  inventoryController.getAddInventoryProduct);

router.post('/addinventory',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  uploadController.multipleUpload,
  inventoryController.postInventoryProduct);

router.get('/productlist',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  inventoryController.listProducts);
router.get('/productlist/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  inventoryController.editInventory);
router.post('/productlist/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  uploadController.multipleUpload,
  inventoryController.updateInventory);
router.post('/addpurchase/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  inventoryController.postProductPurchaseForm);

router.get('/purchasehistory/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  inventoryController.getInventoryPurchaseHistory);
router.get('/editpurchase/:prod_id/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  inventoryController.getEditPurchase);
router.post('/editpurchase/:prod_id/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  inventoryController.postEditPurchase);

// preorder purchase
app.get('/orderpurchase',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  preorderPurchaseController.getPurchaseForm);
app.post('/orderpurchase',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  // upload,
  preorderPurchaseController.postPurchaseForm);

module.exports = router;
