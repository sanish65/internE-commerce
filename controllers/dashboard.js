const dotenv = require('dotenv');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Cache = require('../models/cache');
const Category = require('../models/Category');

dotenv.config({ path: '.env' });

exports.dashboardModerator = (req, res) => {
  const { usertype } = req.user;
  res.render('dashboard', {
    title: 'Dashboard  for moderator',
    usertype,
  });
};

exports.dashboardAdmin = (req, res) => {
  const { usertype } = req.user;
  Order.find({}, (err, result) => {
    if (err) throw err;
    const count = [];
    let countPending = 0;
    let countCancelled = 0;
    let countDelivered = 0;
    const href = {};
    for (let i = 0; i < result.length; i++) {
      href.delivstatus = result[i].delivery.status;
      if (href.delivstatus !== 'cancelled' && href.delivstatus !== 'delivered') {
        countPending += 1;
      } else if (href.delivstatus === 'cancelled') {
        countCancelled += 1;
      } else if (href.delivstatus === 'delivered') {
        countDelivered += 1;
      }
    }
    count.push(countDelivered, countCancelled, countPending);
    res.render('dashboard', {
      count,
      usertype,
      links: []
    });
  });
};

exports.homePage = (req, res) => {
  if ((req.user && req.user.usertype === 'admin') || (req.user && req.user.usertype === 'moderator')) {
    const { usertype } = req.user;
    Order.find({}, (err, result) => {
      if (err) throw err;
      const count = [];
      let countPending = 0;
      let countCancelled = 0;
      let countDelivered = 0;
      const href = {};
      for (let i = 0; i < result.length; i++) {
        href.delivstatus = result[i].delivery.status;
        if (href.delivstatus !== 'cancelled' && href.delivstatus !== 'delivered') {
          countPending += 1;
        } else if (href.delivstatus === 'cancelled') {
          countCancelled += 1;
        } else if (href.delivstatus === 'delivered') {
          countDelivered += 1;
        }
      }
      count.push(countDelivered, countCancelled, countPending);

      Product.find({}, (err, result) => {
        if (err) throw err;
        const displaySet = [];
        for (let i = 0; i < result.length; i++) {
          const href = {};
          href.name = result[i].name;

          const { inventory } = result[i];
          let totalInvCount = 0;
          for (let idx = 0; idx < inventory.length; idx++) {
            const invRef = inventory[idx];
            totalInvCount += invRef.count;
          }
          href.inventorycount = totalInvCount;
          displaySet.push(href);
        }

        res.render('dashboard', {
          usertype,
          count,
          displaySet,
          links: []
        });
      });
    });
  } else if ((req.user && req.user.usertype === 'customer')) {
    Brand.find({}, (err, branddata) => {
      if (err) console.log(err);
      Product.find({}, (err, homedata) => {
        if (err) console.log(err);
        Cache.find({}, (err, cache) => {
          if (err) console.log(err);
          res.render('home', {
            branddata,
            homedata,
            cache: cache[0],
            cart: req.user.cart.length,
          });
        }).sort({ _id: -1 }).limit(1);
      });
    });
  } else {
    Brand.find({}, (err, branddata) => {
      if (err) console.log(err);
      Product.find({}, (err, homedata) => {
        if (err) console.log(err);
        Cache.find({}, (err, cache) => {
          if (err) console.log(err);
          console.log("checking homedata from guest users");
          console.log(homedata);
          res.render('home', {
            branddata,
            homedata,
            cache: cache[0],
            homedata,
            cart: req.session.cart.length,
          });
        }).sort({ _id: -1 }).limit(1);
      });
    });
  }
};

exports.getGuestCarts = (req, res) => {
  console.log('--- getGuestCarts: ', req, res);
};

exports.guestHomePage = (req, res) => {
  if (req.params.id) {
    Product.findById(req.params.id, (err, result) => {
      if (err) throw err;
      const displayProduct = [];
      for (let i = 0; i < result.length; i++) {
        const href = {};
        for (let j = 0; j < result[i].inventory.length; j++) {
          href.totalquantity = result[i].inventory[j].count;
          href.id = result[i]._id;
          href.sku = result[i].sku;
          href.name = result[i].name;
          href.description = result[i].description;
          href.caption = result[i].caption;
          href.price = result[i].price;
          for (let j = 0; j < result[i].photos.length; j++) {
            href.photos = result[i].photos[j].path;
          }
          displayProduct.push(href);
        }
      }
      res.render('productsprism', { items: displayProduct });
    });
  } else {
    Product.find({}, (err, result) => {
      if (err) throw err;
      const displayProduct = [];
      for (let i = 0; i < result.length; i++) {
        const href = {};
        for (let j = 0; j < result[i].inventory.length; j++) {
          href.totalquantity = result[i].inventory[j].count;
          href.id = result[i]._id;
          href.sku = result[i].sku;
          href.name = result[i].name;
          href.description = result[i].description;
          href.caption = result[i].caption;
          href.price = result[i].price;
          for (let j = 0; j < result[i].photos.length; j++) {
            href.photos = result[i].photos[j].path;
          }
          displayProduct.push(href);
        }
      }
      res.render('productsprism', { items: displayProduct });
    });
  }
};

exports.dashboardCustomer = (req, res) => {
  const { usertype } = req.user;
  Product.find({}, (err, result) => {
    if (err) throw err;
    const displayProduct = [];
    for (let i = 0; i < result.length; i++) {
      const href = {};
      for (let j = 0; j < result[i].inventory.length; j++) {
        href.totalquantity = result[i].inventory[j].count;
        href.id = result[i]._id;
        href.sku = result[i].sku;
        href.name = result[i].name;
        href.description = result[i].description;
        href.caption = result[i].caption;
        href.price = result[i].price;
        for (let j = 0; j < result[i].photos.length; j++) {
          href.photos = result[i].photos[j].path;
        }
        displayProduct.push(href);
      }
    }
    res.render('dashboard', {
      title: 'Dashboard  for customer',
      items: displayProduct,
      usertype,
    });
  });
};

exports.getProductDefinePage = (req, res) => {
  Product.findById(req.params.id, (err, result) => {
    if (err) console.log(err);
    const user = req.user ? req.user : 'annonymous';

    let invCount = 0;
    for (let i = 0; i < result.inventory.length; i++) { // chck available inventory count
      invCount += result.inventory[i].count;
    }

    if (user === 'annonymous') {
      let ratedStars = 0;
      let totalRated = 0;

      for (let i = 0; i < result.review.length; i++) {
        ratedStars = result.review[i].rate;
        totalRated += result.review[i].rate;
      }
      const avgRated = totalRated / (result.review.length + 1);

      let arr = [];
      const cat = result.category.length;
      for (let i = 0; i < cat; i++) { // arranging category to and from "You may like"
        arr = result.category[i];
      }

      Product.find({ category: arr }, (err, prods) => {
        if (err) console.log(err);
        res.render('product', {
          info: result,
          prods,
          invCount,
          ratedStars,
          avgRated,
          cart: req.user ? req.user.cart.length : req.session.cart.length,
        });
      });
    } else {
      let ratedStars = 0;
      let totalRated = 0;

      for (let i = 0; i < result.review.length; i++) {
        if (result.review[i].user === req.user.email) {
          ratedStars = result.review[i].rate;
        }
        totalRated += result.review[i].rate;
      }
      const avgRated = totalRated / (result.review.length + 1);

      const { category } = result;
      Product.find({ category }, (err, prods) => {
        if (err) console.log(err);
        res.render('product', {
          info: result,
          prods,
          invCount,
          ratedStars,
          avgRated,
          cart: req.user ? req.user.cart.length : req.session.cart.length,
        });
      });
    }
  });
};

exports.getFeaturedInfo = (req, res) => {
  Category.find({},(err,categories) => {
    if(err) console.log(err);
  let categoryOptions = [];
  for(let i=0;i<categories.length; i++){
    categoryOptions.push(categories[i].name);
  }
  let catName = 'Shop';
  if (req.params.id === 'shop') {
    Product.find({}, (err, result) => {
      if (err) console.log(err);
      Brand.find({}, (err, brands) => {
        if (err) console.log(err);
        res.render('commonShop', {
          info: result,
          brands,
          catName,
          categoryOptions,
          cart: req.user ? req.user.cart.length : req.session.cart.length,
        });
      });
    });
  }
  if (req.params.id === 'bestseller') {
    catName = 'Shop';
    Product.find({ featuretype: 'most-selled' }, (err, result) => {
      if (err) console.log(err);
      Brand.find({}, (err, brands) => {
        if (err) console.log(err);
        res.render('commonShop', {
          info: result,
          brands,
          categoryOptions,
          cart: req.user ? req.user.cart.length : req.session.cart.length,
        });
      });
    });
  }
  if (req.params.id === 'featured') {
    Product.find({ featuretype: 'feature' }, (err, result) => {
      if (err) console.log(err);
      Brand.find({}, (err, brands) => {
        if (err) console.log(err);
        res.render('commonShop', {
          info: result,
          brands,
          categoryOptions,
          cart: req.user ? req.user.cart.length : req.session.cart.length,
        });
      });
    });
  }
});
};

exports.getBrandInfoPage = (req, res) => {
  let cartLn;
  if (!req.user) {
    cartLn = req.session.cart.length;
  } else {
    cartLn = req.user.cart.length;
  }
  Brand.find({}, (err, result) => {
    if (err) console.log(err);
    res.render('brand', {
      brand: result,
      cart: cartLn,
    });
  });
};

exports.categoryOptions = (req, res) => {
  console.log(req.body);
  Category.find({},(err,categories) => {
    if(err) console.log(err);

  let categoryOptions = [];
  for(let i=0;i<categories.length; i++){
    categoryOptions.push(categories[i].name);
  }
  Product.find({}, (err, result) => {
    if (err) console.log(err);
    const arr = [];
    for (let j = 0; j < result.length; j++) {
      const cat = result[j].category.length;
      for (let i = 0; i < cat; i++) {
        arr.push(result[j].category[i]);
      }
    }
    const { category } = req.body;
    const desiredCategory = arr.filter((element) => {
      if (category === 'allproducts') return element;
      return element.split(':')[1] === category;
    });
    Product.find({ category: desiredCategory }, (err, result) => {
      if (err) console.log(err);
      Brand.find({}, (err, brands) => {
        if (err) console.log(err);
        res.render('commonShop', {
          info: result,
          brands,
          categoryOptions,
          Category: category,
          cart: req.user ? req.user.cart.length : req.session.cart.length,
          selected: category,
        });
      });
    });
  });
});
};

exports.getBrandedPage = (req, res) => {
  Brand.findById(req.params.id)
    .then((brands) => {
      let ratedStars = 0;

      for (let i = 0; i < brands.review.length; i++) {
        if (brands.review[i].user === req.user.email) {
          ratedStars = brands.review[i].rate;
        }
      }

      Product.find({ brand: brands.name })
        .then((products) => {
          res.render('brandPage', {
            info: brands,
            prods: products,
            cart: req.user ? req.user.cart.length : req.session.cart.length,
            ratedStars,

          });
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
};

exports.postProductReview = (req, res) => {
  const user = req.user ? req.user.email : 'Anonymous';
  console.log(user);
  try {
    const newValues = {
      $push: {
        comments: [{
          name: user,
          comment: req.body.comments,
          date: new Date(),
        }],
      }
    };

    Product.findByIdAndUpdate(req.params.id, newValues, (err) => {
      if (err) console.log(err);

      res.redirect(`/homepage/product/${req.params.id}`);
    });
  } catch (error) {
    console.error(error);
    res.redirect(`/homepage/product/${req.params.id}`);
  }
};
exports.postBrandReview = (req, res) => {
  const user = req.user ? req.user.email : 'Anonymous';
  console.log(user);
  try {
    const newValues = {
      $push: {
        comments: [{
          name: user,
          comment: req.body.comments,
          date: new Date(),
        }],
      }
    };

    Brand.findByIdAndUpdate(req.params.id, newValues, (err) => {
      if (err) console.log(err);

      res.redirect(`/homepage/branded/${req.params.id}`);
    });
  } catch (error) {
    console.error(error);
    res.redirect(`/homepage/branded/${req.params.id}`);
  }
};

exports.getBrandRated = (req, res) => {
  let flag = 0;
  let index = 0;
  if (req.user) {
    Brand.findById(req.params.id, (err, result) => {
      if (err) console.log(err);

      if (result.review.length > 0) {
        for (let i = 0; i < result.review.length; i++) {
          if (result.review[i].user === req.user.email) {
            flag = 1;
            index = i;
          }
        }
        if (flag === 1) {
          result.review[index].user = req.user.email;
          result.review[index].rate = req.body.rate;

          result.save((err) => {
            if (err) {
              res.redirect(`/homepage/branded/${req.params.id}`);
            } else {
              res.redirect(`/homepage/branded/${req.params.id}`);
            }
          });
        } else {
          const newValues = {
            $push: {
              review: [{
                user: req.user.email,
                rate: req.body.rate,
              }],
            }
          };

          Brand.findByIdAndUpdate(req.params.id, newValues, (err) => {
            if (err) console.log(err);
            res.redirect(`/homepage/branded/${req.params.id}`);
          });
        }
      } else {
        const newValues = {
          $push: {
            review: [{
              user: req.user.email ? req.user.email : req.session._id,
              rate: req.body.rate,
            }],
          }
        };

        Brand.findByIdAndUpdate(req.params.id, newValues, (err, success) => {
          if (err) console.log(err);
          console.log(success);
          res.redirect(`/homepage/branded/${req.params.id}`);
        });
      }
    });
  } else {
    console.log('Not a Registered user,cant rate');
    res.redirect(`/homepage/branded/${req.params.id}`);
  }
};

exports.getProductRated = (req, res) => {
  let flag = 0;
  let index = 0;
  if (req.user) {
    Product.findById(req.params.id, (err, result) => {
      if (err) console.log(err);

      if (result.review.length > 0) {
        for (let i = 0; i < result.review.length; i++) {
          if (result.review[i].user === req.user.email) {
            flag = 1;
            index = i;
          }
        }
        if (flag === 1) {
          result.review[index].user = req.user.email;
          result.review[index].rate = req.body.rate;
          result.save((err) => {
            if (err) {
              res.redirect(`/homepage/product/${req.params.id}`);
            } else {
              console.log('success from if  one for product');
              res.redirect(`/homepage/product/${req.params.id}`);
            }
          });
        } else {
          const newvalues = {
            $push: {
              review: [{
                user: req.user.email,
                rate: req.body.rate,
              }],
            }
          };

          Product.findByIdAndUpdate(req.params.id, newvalues, (err, success) => {
            if (err) console.log(err);
            if (success) console.log('success from else one for product');
            res.redirect(`/homepage/product/${req.params.id}`);
          });
        }
      } else {
        const newvalues = {
          $push: {
            review: [{
              user: req.user.email ? req.user.email : req.session._id,
              rate: req.body.rate,
            }],
          }
        };

        Product.findByIdAndUpdate(req.params.id, newvalues, (err, success) => {
          if (err) console.log(err);
          if (success) console.log('success');
          res.redirect(`/homepage/product/${req.params.id}`);
        });
      }
    });
  } else {
    res.redirect(`/homepage/product/${req.params.id}`);
  }
};

exports.getBrandInfo = (req, res) => {
  Brand.findById(req.params.id)
    .then((result) => {
      Product.find({ brand: result.name })
        .then((resultall) => {
          console.log('resultall');

          console.log(resultall);
          res.render('brandsProduct', {
            brand: result,
            brandall: resultall
          });
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
};

exports.postSearchBar = (req, res) => {
  const letter = req.body.searchname;
  Product.find({ name: letter })
    .then((result) => {
      res.redirect(`/homepage/product/${result[0]._id}`);
    })
    .catch(() => {
      req.flash('errors', { msg: 'It appears no such product we have.' });
      res.redirect('/');
    });
};

exports.searchProductName = (req, res) => {
  const regex = new RegExp(req.query.term, 'i');
  const products = Product.find({ name: { $regex: regex } }, {
    name: 1, _id: 1, price: 1, wtype: 1, wmain: 1, wsub: 1
  })
    .sort({ updated_at: -1 })
    .sort({ created_at: -1 })
    .limit(100);
  products.exec((err, data) => {
    const result = [];
    if (!err) {
      if (data && data.length && data.length > 0) {
        data.forEach((test) => {
          result.push(`${test.name}`);
        });
      }
      res.jsonp(result);
    }
  });
};

exports.getFaq = (req, res) => {
  console.log('I am checked.');
  res.render('faq', {
    title: 'FAQs'
  });
};
