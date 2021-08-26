const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = (req, res) => {
  let cartLength;
  if (!req.user) {
    cartLength = req.session.cart.length;
  } else {
    cartLength = req.user.cart.length;
  }
  Category.find({}).then((cat) => {
    res.render('categories', {
      cat,
      title: 'category',
      cart: cartLength,
    });
  })
    .catch((error) => console.log(error));
};

exports.getCategoriesProduct = (req, res) => {
  Category.find({ name: req.params.id })
    .then((category) => {
      const catName = `${category[0]._id}:${category[0].name}`;
      Product.find({ category: catName })
        .then((result) => {
          Brand.find({})
            .then((brands) => {
              res.render('commonShop', {
                info: result,
                catName: category[0].name,
                brands,
              });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => console.log(error));
};
