const express = require('express');

const router = express.Router();

const orderController = require('../controllers/order');
const passportConfig = require('../lib/passport');
const cartController = require('../controllers/cart');
// router.use("/order", ordercontroller);

router.get('/orderform', orderController.getOrderForm);
router.post('/orderform', orderController.postOrderForm);
router.post('/addtocart', cartController.addCart);
router.post('/addtocart/:id', cartController.addCart);
router.get('/mycart', cartController.myCart);
router.post('/removecart/:id', cartController.removeCart);

router.post('/buylater/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('customer'),
  cartController.buyLater,);
router.get('/buynow', orderController.buyNow);
router.post('/buynow', orderController.buyNow);
router.post('/booknow', passportConfig.isAuthenticated, orderController.buyNow);
router.post('/confirmation', orderController.confirmOrder);
router.get('/myorder',
  cartController.myOrder,);
router.get('/list',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'investor'),
  orderController.showOrders,);
router.get('/:status',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'investor'),
  orderController.showDelivStatus,);
router.get('/editorder/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  orderController.editOrder,);
router.post('/editorder/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  orderController.updateOrder,);
router.get('/editorder/search/searchproductname',
  passportConfig.isAuthenticated,
  orderController.searchProductName,);
router.get('/createbilltemplate/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  orderController.getBillTemplate,);
router.get('/createbilltemplate/:color/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  orderController.createBill,);
router.get('/createbill/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  orderController.createBill,);
router.get('/matchproduct/:id',
  orderController.matchProduct,);
router.post('/matchproduct/:id',
  orderController.postMatchProduct,);
router.get('/searchcustomer', orderController.getSearchForm);
router.post('/searchcustomer', orderController.postSearchForm);
router.post('/searchcustomer/:id', orderController.postOrderForm);
router.post('/khalti/verifyPayment', orderController.postKhaltiVerification);
router.get('/buynow/success/', orderController.getEsewaVerification);
router.get('/getListLinks/listed',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin', 'moderator'),
  orderController.getListLinks);
router.post('/sendlink',
  orderController.postLinks);
module.exports = router;
