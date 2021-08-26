/* eslint-disable no-unused-vars */
const { ObjectId } = require('mongodb');
const User = require('../models/User');
const Product = require('../models/Product');

exports.addCart = (req, res, next) => {
  const { id: paramsId } = req.params;
  const {
    id: requestBodyId, sku, productname, description, photos, caption, productprice, quantity: requestBodyQuantity
  } = req.body;
  const cart = {};
  cart.productid = paramsId || requestBodyId;
  cart.sku = sku;
  cart.productname = productname;
  cart.description = description;
  cart.photos = photos;
  cart.caption = caption;
  cart.price = productprice;
  cart.quantity = paramsId ? 1 : requestBodyQuantity;
  cart.totalprice = cart.price * cart.quantity;

  if (!req.user) {
    cart._id = ObjectId();
    let newquantity = 0;
    for (let i = 0; i < req.session.cart.length; i++) {
      const { productid, quantity: sessionCartQuantity } = req.session.cart[i];
      if (cart.productid === productid) {
        newquantity = sessionCartQuantity;
        req.session.cart.splice(i, 1);
      }
    }
    if (newquantity > 0) {
      cart.quantity = parseInt(newquantity, 10) + parseInt(requestBodyQuantity, 10);
      cart.totalprice = cart.quantity * cart.price;
    }

    req.session.cart.push(cart);
    req.flash('success', { msg: 'Product added to cart successfully!!' });
    res.redirect('/order/mycart');
  } else {
    User.findById(req.user.id, (err, user) => {
      if (err) return next(err);

      let quantity;
      let totalprice;
      let availableQuantity;
      Product.findById(requestBodyId, (_err, product) => {
        for (let i = 0; i < product.inventory.length; i++) {
          availableQuantity = product.inventory[i].count;
        }
        for (let i = 0; i < req.user.cart.length; i++) {
          const { productid, quantity: userCartQuantity, price } = req.user.cart[i];
          if (productid === requestBodyId) {
            quantity = userCartQuantity + parseInt(requestBodyQuantity, 10);
            if (quantity > availableQuantity) {
              quantity = availableQuantity;
            }
            totalprice = quantity * price;
          }
        }
        if (quantity > 0) {
          User.findOneAndUpdate({
            _id: req.user.id,
            'cart.productid': requestBodyId,
          },
          {
            $set: {
              'cart.$.quantity': quantity,
              'cart.$.totalprice': totalprice,
            }
          })
            .then(() => {
              req.flash('info', { msg: 'Product already in your cart!!' });
              res.redirect('/');
            })
            .catch((err) => {
              console.log(err);
              res.redirect('/');
            });
        } else {
          user.cart.push(cart);
          user.save((err) => {
            if (err) return next(err);

            req.flash('success', { msg: 'Product added to cart successfully!!' });
            res.redirect('/order/mycart');
          });
        }
      });
    });
  }
};

exports.myCart = async (req, res, next) => {
  try {
    const cartItems = [];
    let { cart } = req.session;
    if (req.user) {
      const user = await User.findById(req.user.id);
      cart = user.cart;
    }

    const productIds = cart.map(({ productid }) => productid);
    const products = await Product.find({ _id: { $in: productIds } });

    cart.forEach((cartItem) => {
      const productObject = products.find((p) => p._id.toString() === cartItem.productid);
      for (let k = 0; k < productObject.inventory.length; k++) {
        cartItem.totalquantity = productObject.inventory[k].count;
      }
      if (cartItem.quantity > cartItem.totalquantity) {
        cartItem.quantity = cartItem.totalquantity;
      }
      cartItems.push(cartItem);
    });
    return res.render('cart/mycart', {
      title: 'My cart',
      cartItems
    });
  } catch (err) {
    return next(err);
  }
};

exports.removeCart = (req, res) => {
  if (!req.user) {
    for (let i = 0; i < req.session.cart.length; i++) {
      if (req.session.cart[i]._id === req.params.id) {
        req.session.cart.splice(i, 1);
      }
    }
    res.redirect('/order/mycart');
  } else {
    User.findOneAndUpdate({ _id: req.user.id },
      {
        $pull:
        {
          cart: { _id: req.params.id }
        }
      })
      .then(() => {
        req.flash('info', { msg: 'Product has been deleted from your cart.' });
        res.redirect('/order/mycart');
      })
      .catch((err) => {
        console.log(err);
        req.flash('errors', { msg: 'Your cart was unable to remove. Please try again later.' });
        res.redirect('/order/mycart');
      });
  }
};

exports.myOrder = (req, res, next) => {
  if (!req.user) {
    const orders = [];
    for (let i = 0; i < req.session.ordereditem.length; i++) {
      const orderedItem = req.session.ordereditem[i];
      orders.push(orderedItem);
    }
    res.render('order/user/myorder', {
      title: 'My cart',
      items: orders,
      cart: req.session.cart.length,
    });
  } else {
    User.findById(req.user.id, (error, user) => {
      if (error) {
        return next(error);
      }
      const orders = [];
      for (let i = 0; i < user.ordereditem.length; i++) {
        const orderedItem = req.user.ordereditem[i];
        orders.push(orderedItem);
      }
      res.render('order/user/myorder', {
        title: 'My Orders',
        items: orders,
        cart: req.user.cart.length,
      });
    });
  }
};

exports.buyLater = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      next(err);
    }
    for (let i = 0; i < req.user.cart.length; i++) {
      if (req.user.cart[i].id === req.params.id) {
        user.buylater.push(user.cart[i]);
      }
    }
    user.save((err) => {
      if (err) return next(err);
      res.redirect('/order/mycart');
    });
  });
  User.findOneAndUpdate({ _id: req.user.id },
    {
      $pull:
      {
        cart: { _id: req.params.id }
      }
    })
    .then(() => {
      req.flash('info', { msg: 'Product has been added to buy later from your cart.' });
    })
    .catch((err) => {
      console.log(err);
      req.flash('errors', { msg: 'Your cart was unable to move. Please try again later.' });
    });
};
