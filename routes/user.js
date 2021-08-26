const express = require('express');

const router = express.Router();
const passportConfig = require('../lib/passport');
const dashboardController = require('../controllers/dashboard');
const contactController = require('../controllers/contact');
const userController = require('../controllers/user');
const { AuthUserType } = require('../src/constants');

router.get('/', dashboardController.homePage);
router.get('/products', dashboardController.guestHomePage);

router.get(`/${AuthUserType.admin}/dashboard`,
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole(AuthUserType.admin),
  dashboardController.dashboardAdmin);
router.get(`/${AuthUserType.customer}/dashboard`,
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole(AuthUserType.customer),
  dashboardController.dashboardCustomer);
router.get(`/${AuthUserType.moderator}/dashboard`,
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole(AuthUserType.moderator),
  dashboardController.dashboardModerator);
router.get(`/${AuthUserType.investor}/dashboard`,
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole(AuthUserType.moderator),
  dashboardController.dashboardAdmin);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/logout', userController.logout);
router.get('/forgot', userController.getForgot);
router.post('/forgot', userController.postForgot);
router.get('/forgot/reset/:token', userController.getReset);
router.post('/forgot/reset/:token', userController.postReset);
router.get('/signup/:usertype', userController.getSignup);
router.post('/signup/:usertype', userController.postSignup);
router.get('/contact', contactController.getContact);
router.post('/contact', contactController.postContact);
router.get('/account',
  passportConfig.isAuthenticated,
  userController.getAccount,);

router.get('/clientaccount',
  passportConfig.isAuthenticated,
  userController.getAccount,);

router.post('/account/profile',
  passportConfig.isAuthenticated,
  userController.postUpdateProfile,);

router.post('/account/clientprofile',
  passportConfig.isAuthenticated,
  userController.postUpdateProfile,);

router.post('/account/password',
  passportConfig.isAuthenticated,
  userController.postUpdatePassword,);

router.post('/account/clientpassword',
  passportConfig.isAuthenticated,
  userController.postUpdatePassword,);

router.post('/account/delete',
  passportConfig.isAuthenticated,
  userController.postDeleteAccount,);
router.get('/userlist',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  userController.userList,);
router.get('/edituser/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  userController.editUser,);
router.post('/edituser/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  userController.updateUser,);
router.get('/deleteuser/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  userController.deleteUser,);
router.post('/deleteuser/:id',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  userController.deleteUser,);
router.get('/createuser',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  userController.getCreateUser,);
router.post('/createuser',
  passportConfig.isAuthenticated,
  passportConfig.isAuthRole('admin'),
  userController.postCreateUser,);
module.exports = router;
