const express = require('express');
const compression = require('compression');
const session = require('express-session');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
// const multer = require('multer');
const cors = require('cors');

dotenv.config({ path: '.env' });

// router handlers
const inventory = require('./routes/inventory');
const brandCategory = require('./routes/brandandcategory');
const ordercontroller = require('./routes/order');
const producttracker = require('./routes/producttracker');
const homepage = require('./routes/homepage');
const dataController = require('./controllers/datavisualize');
const userRoute = require('./routes/user');
const customizeRoute = require('./routes/customization');

// Design page Controller
require('./controllers/categories');
const brandController = require('./controllers/brandandcategory');
const productController = require('./controllers/product');
// const upload = multer({ dest: path.join(__dirname, "uploads") });

/**
 * Controllers (route handlers).
 */
require('./controllers/user');
require('./controllers/contact');
require('./controllers/order');
require('./controllers/inventory');
require('./controllers/preorderpurchase');
require('./controllers/purchase');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.',
    chalk.red('✗'));
  process.exit();
});

app.use(cors());

// === API
app.get('/api', (req, res) => {
  res.status(200).send({
    data: [
      { name: 'America', code: 'US' },
      { name: 'Australia', code: 'AU' },
    ],
  });
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  }),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.cart = [] || req.session.cart;
  res.locals.ordereditem = [] || req.session.ordereditem;
  next();
});

app.use((req, _res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (!req.session.ordereditem) {
    req.session.ordereditem = [];
  }
  next();
});

app.use('/',
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), {
    maxAge: 31557600000,
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
    maxAge: 31557600000,
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/jquery/dist'), {
    maxAge: 31557600000,
  }));
app.use('/webfonts',
  express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'),
    { maxAge: 31557600000 }));

// Design Routes
app.get('/brand', brandController.getBrand);
app.get('/product/:id', productController.getProduct);
app.get('/product', productController.getProduct);
app.get('/datavisualize/CountProduct', dataController.getCountData);
app.get('/datavisualize/countUser', dataController.getCountUser);
app.use('/', userRoute);
app.use('/order', ordercontroller);
app.use('/inventory', inventory);
app.use('/customization', customizeRoute);
/**
  * Brand And Categories
*/
app.use('/brandandcategory', brandCategory);
app.use('/homepage', homepage);

/**
 * Preorder purchase
 */
app.use('/preorder', inventory);
app.use('/producttracker', producttracker);
app.use('/purchase', inventory);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

module.exports = app;
