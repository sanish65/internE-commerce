const { ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const { v4: uuidv4  } = require('uuid');
const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Link = require('../models/Links')
const User = require('../models/User');
const dropdown = require('../helpers/dropdown.json');
const mailer = require('../lib/mailer');
const { MonthNames, PaymentMethodChoices } = require('../src/constants');

dotenv.config({ path: '.env' });

/**
 * GET /
 * Order Lists
 */
exports.getOrderForm = (_req, res) => {
  const dropDownPayment = dropdown.payment_method;
  res.render('order/admin/orderform', { dropDownPayment, });
};

exports.postOrderForm = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', { msg: 'Failed to insert into the database' });
  }
  const productInfo = [];
  for (let i = 0; i < 5; i++) {
    if (req.body.productname[i] && req.body.quantity[i]) {
      productInfo.push({
        name: req.body.productname[i],
        count: req.body.quantity[i],
        status: 'unmatched'
      });
    }
  }

  let orderInstance;
  if (req.params.id) {
    Order.findById(req.params.id, (err, order) => {
      const {
        notes, location, nearby, city, paymentmethod
      } = req.body;
      orderInstance = new Order({
        userdetails: order.userdetails,
        delivery: {
          status: 'ordered',
          cost: 0,
          notes,
        },
        address: { location, nearby, city },
        products: productInfo,
        paymentmethod,
      });
    });
    Order.findOne({}, {}, { sort: { _id: -1 } }, (err, order) => {
      const orderNum = order.ordernum + 1;
      orderInstance.ordernum = orderNum;
      orderInstance.save((err) => {
        if (err) {
          req.flash('errors', { msg: 'Failed to insert into the database' });
          res.redirect('order/searchcustomer');
        } else {
          req.flash('success', { msg: 'Your order is sucessfully submitted' });
          res.redirect('order/searchcustomer');
        }
      });
    });
  } else {
    let orderNum = 0;
    Order.findOne({}, {}, { sort: { _id: -1 } }, (err, order) => {
      orderNum = !order ? 1000 : order.ordernum + 1;
      const {
        fname, lname, phone, email, instagram, dob, notes, location, nearby, city, paymentmethod
      } = req.body;
      const orderInstance = new Order({
        ordernum: orderNum,
        userdetails: {
          firstname: fname,
          lastname: lname,
          phone,
          email,
          instagram,
          dob,
        },
        delivery: {
          status: 'ordered',
          cost: 0,
          notes,
        },
        address: { location, nearby, city },
        products: productInfo,
        paymentmethod,
      });

      orderInstance.save((err) => {
        if (err) {
          console.log(err);
          req.flash('errors', {
            msg:
              'Your order could not be submitted. Please fill out correct information',
          });
          res.redirect('orderform');
        } else {
          req.flash('success', { msg: 'Your order is sucessfully submitted' });
          res.redirect('orderform');
        }
      });
    });
    if (req.user) {
      User.findById(req.user.id, (err, user) => {
        const {
          productname, quantity, paymentmethod
        } = req.body;
        for (let i = 0; i < 5; i++) {
          if (productname[i] && quantity[i]) {
            user.ordereditem.push({
              productname: productname[i],
              paymentmethod,
              price: {
                quantity: quantity[i],
              }
            });
          }
        }
        user.save((err) => {
          if (err) {
            return next(err);
          }
        });
      });
    }
  }
};

exports.getSearchForm = (req, res) => {
  res.render('order/searchcustomer', {
    title: 'Search Customer Detail',
  });
};

exports.postSearchForm = (req, res) => {
  const { phone } = req.body;
  Order.find({ 'userdetails.phone': phone }, (err, customer) => {
    if (err) {
      console.log(err);
      req.flash('errors', { msg: 'Failed to insert into the database' });
    }

    if (!Array.isArray(customer) || !customer.length) {
      res.render('order/searchcustomer', { item: 'empty' });
    } else {
      const data = customer[0];
      res.render('order/searchcustomer', { item: data });
    }
  });
};

exports.getListLinks = (req,res) => {
  Link.find({},(err,links) => {
    console.log(links);
    if(err) console.log(err);
    res.render("links/listLinks" , {
      links,
      title : "Links list"
    })
  })
}

exports.postLinks = (req,res) => { 
  var document = new Link({
    link : req.body.link,
    name : req.body.name,
    address : req.body.address,
    phone : req.body.phone,
    insta : req.body.insta,
    email : req.body.email,
  });
  document.save((err) => {
    if(err) console.log(err);
    console.log("linked successfully");
    res.redirect("/");
  })
}

exports.showOrders = (req, res) => {
  Order.find({}, (err, result) => {
    if (err) throw err;
    const displaySet = [];
    for (let i = 0; i < result.length; i++) {
      const { _id, createdAt } = result[i];
      const href = {
        id: _id,
        date: `${createdAt.getDate()} ${MonthNames[createdAt.getMonth()]}`
      };
      href.ordernum = result[i].ordernum;
      href.firstname = result[i].userdetails.firstname;
      href.email = result[i].userdetails.email;
      href.phone = result[i].userdetails.phone;
      href.insta = result[i].userdetails.instagram;
      href.city = result[i].address.city;
      href.products = result[i].products;
      href.prod = '|';
      href.prodcount = '';
      href.prodprice = '';
      href.delivstatus = result[i].delivery.status;
      href.delivperson = result[i].delivery.person;
      const colorcode = { cancelled: 'red', delivered: 'blue' };
      href.colorcode = colorcode[result[i].delivery.status];
      let totalPrice = 0;
      for (let j = 0; j < href.products.length; j++) {
        const pHref = href.products[j];
        if (pHref.name === '') {
          break;
        }
        href.prod = `${href.prod + pHref.name} | `;
        href.prodcount = `${href.prodcount + pHref.count} `;
        href.prodprice = `${href.prodprice + pHref.price} `;
        totalPrice += pHref.price * pHref.count;
      }
      href.delcost = result[i].delivery.cost || 0;
      href.delstatus = result[i].delivery.status;
      href.totalprice = totalPrice + href.delcost;
      displaySet.push(href);
    }
    displaySet.reverse();
    res.render('order/admin/orderlist', { items: displaySet });
  });
};

exports.editOrder = (req, res) => {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
      return err;
    }
    order.dropDownDeliv = dropdown.deliv_status;
    order.dropDownPayment = dropdown.payment_method;
    if (order.delivery.status === 'delivered' || order.delivery.status === 'cancelled') {
      order.freeze = 1;
    }
    res.render('order/admin/editorder', { orders: order });
  });
};

exports.searchProductName = (req, res) => {
  const regex = new RegExp(req.query.term, 'i');
  const nameFilter = Product.find({ name: regex }).sort({ updated_at: -1 }).sort({ created_at: -1 }).limit(10);
  nameFilter.exec((err, data) => {
    const result = [];
    if (!err) {
      if (data && data.length && data.length > 0) {
        data.forEach((product) => {
          const obj = {
            id: product._id,
            name: product.name
          };
          result.push(obj);
        });
      }
      res.jsonp(result);
    }
  });
};

exports.updateOrder = (req, res, next) => {
  req.assert('phone', 'Phone number must be number').isNumeric();
  req.assert('orderno', 'Order Number').isNumeric();
  Order.findById(req.params.id, (err, order) => {
    if (err) return next(err);

    const {
      fname, lname, phone, email, insta, dob, delivperson, notes, delivcost, location, nearby, city, paymentmethod,
      prodname, prodprice, prodcount, delivstatus: requestBodyDelivStatus
    } = req.body;
    order.userdetails = {
      firstname: fname || '',
      lastname: lname || '',
      phone: phone || '',
      email: email || '',
      instagram: insta || '',
      dob: dob || ''
    };
    order.delivery = {
      person: delivperson,
      notes,
      cost: delivcost
    };
    order.address = {
      location,
      nearby,
      city
    };
    order.paymentmethod = paymentmethod;

    const today = new Date();
    const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const formattedTime = today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const availProductList = order.products;
    for (let i = 0; i < availProductList.length; i++) {
      const availProdId = availProductList[i]._id;
      if (req.body[availProdId]) {
        const dataFromPost = req.body[availProdId];
        const [name, price, count] = dataFromPost;
        order.products[i] = { name, price, count };
      }
    }
    if (order.delivery.status === 'delivered' || order.delivery.status === 'cancelled') {
      order.freeze = 1;
    } else {
      order.delivery.status = requestBodyDelivStatus;
    }

    if (requestBodyDelivStatus === 'delivered' || requestBodyDelivStatus === 'cancelled') {
      order.updatedstatus = `${date}  ${formattedTime}`;
    }
    if (prodname && prodprice && prodcount) {
      order.products.push({ name: prodname, price: prodprice, count: prodcount });
    }
    order.save((err) => {
      if (err) return next(err);

      req.flash('success', { msg: 'Order information has been updated.' });
      order.dropDownDeliv = dropdown.deliv_status;
      order.dropDownPayment = dropdown.payment_method;

      const { status: orderDeliveryStatus } = order.delivery;
      if (orderDeliveryStatus === 'delivered' || orderDeliveryStatus === 'cancelled') {
        order.freeze = 1;
      }
      res.render('order/admin/editorder', { orders: order });
    });
  });
};
exports.getBillTemplate = (req, res) => {
  const { id } = req.params;
  res.render('billtemplate/createbilltemplate', { _id: id });
};

exports.createBill = (req, res) => {
  Order.findById(req.params.id, (_err, {
    ordernum, createdAt, products, address: orderAddress, delivery, userdetails
  }) => {
    const href = {
      ordernum,
      orderdate: `${createdAt.getDate()} ${MonthNames[createdAt.getMonth()]} ${createdAt.getFullYear()}`,
      products: []
    };
    let totalPrice = 0;
    for (let i = 0; i < products.length; i++) {
      const prodHref = products[i];
      prodHref.subtotal = Number(prodHref.price) * Number(prodHref.count);
      totalPrice = Number(totalPrice) + Number(prodHref.subtotal);
      href.products.push(prodHref);
    }
    href.location = orderAddress.location;
    href.city = orderAddress.city;
    href.nearby = orderAddress.nearby;
    href.deliverycost = delivery.cost || 0;
    href.notes = delivery.notes || '';
    href.totalprice = totalPrice + Number(href.deliverycost);
    const usrHref = userdetails;
    href.name = `${usrHref.firstname} ${usrHref.lastname}`;
    href.phone = usrHref.phone;
    href.email = usrHref.email;
    href.insta = usrHref.instagram;

    const { color: reqParamsColor } = req.params;
    if (reqParamsColor === 'blue') {
      res.render('billtemplate/bluebill', { order: href });
    } else if (reqParamsColor === 'red') {
      res.render('billtemplate/redbill', { order: href });
    } else if (reqParamsColor === 'yellow') {
      res.render('billtemplate/yellowbill', { order: href });
    } else {
      res.render('order/admin/createbill', { order: href });
    }
  });
};

exports.showDelivStatus = (req, res) => {
  const queryArray = [];
  if (req.params.status === 'cancelled') {
    queryArray.push(req.params.status);
  } else if (req.params.status === 'delivered') {
    queryArray.push(req.params.status);
  } else {
    queryArray.push('ordered', 'purchased', 'deliveredUS', 'deliveredKtm', 'shippedUS', 'shippedKtm');
  }
  Order.find({ 'delivery.status': queryArray }, (err, result) => {
    if (err) throw err;
    const displaySet = [];
    for (let i = 0; i < result.length; i++) {
      const {
        _id, createdAt, ordernum, userdetails, address, products, delivery
      } = result[i];
      const href = {
        id: _id,
        date: `${createdAt.getDate()} ${MonthNames[createdAt.getMonth()]}`,
        ordernum,
        firstname: userdetails.firstname,
        email: userdetails.email,
        phone: userdetails.phone,
        insta: userdetails.instagram,
        city: address.city,
        products,
        prod: '|',
        prodcount: '',
        prodprice: '',
        delivstatus: delivery.status,
        delivperson: delivery.person,
      };
      let totalPrice = 0;
      for (let j = 0; j < href.products.length; j++) {
        const pHref = href.products[j];
        if (pHref.name === '') {
          break;
        }
        href.prod = `${href.prod + pHref.name} | `;
        href.prodcount = `${href.prodcount + pHref.count} `;
        href.prodprice = `${href.prodprice + pHref.price} `;
        totalPrice += pHref.price * pHref.count;
      }
      href.delcost = result[i].delivery.cost || 0;
      href.delstatus = result[i].delivery.status;
      href.totalprice = totalPrice + href.delcost;
      displaySet.push(href);
    }
    res.render('order/admin/orderlist', { items: displaySet });
  });
};

exports.matchProduct = (req, res, next) => {
  const productname = [];
  Product.find({}, (err, product) => {
    console.log('checking the product');
    console.log(product);
    if (err) {
      return next(err);
    }
    for (let i = 0; i < product.length; i++) {
      if (product[i].producttype === 'Pre-purchase') {
        const href = {};
        href.productid = product[i]._id;
        href.productname = product[i].name;
        href.description = product[i].description;
        href.price = product[i].price;
        href.photos = product[i].photos[0].path;
        href.caption = product[i].caption;
        href.quantity = product[i].inventory[0].count;
        productname.push(href);
      }
    }
    Order.findById(req.params.id, (err, order) => {
      const href = {};
      href.productCount = order.products[0].count;
      href._id = req.params.id;
      href.email = order.userdetails.email;
      res.render('matchorder', {
        title: 'Match order',
        items: productname,
        href,
      });
    });
  });
};

exports.postMatchProduct = (req, res, next) => {
  Product.find({}, (err, product) => {
    for (let i = 0; i < product.length; i++) {
      if (product[i].name === req.body.productname) {
        Order.findOneAndUpdate({
          _id: req.params.id,
          'products.name': req.body.productname,
        },
        {
          $set: {
            'products.$.productid': product[i]._id,
            'products.$.description': product[i].description,
            'products.$.price': product[i].price,
            'products.$.photos': product[i].photos[0].path,
            'products.$.caption': product[i].caption,
            'products.$.count': req.body.quantity,
            'products.$.status': 'matched',
          }
        })
          .then(() => {
            console.log('Set successfully');
            res.redirect(`/order/editorder/${req.params.id}`);
          })
          .catch((err) => {
            console.log(err);
          });
        User.find({}, (err, user) => {
          for (let j = 0; j < user.length; j++) {
            if (user[j].email === req.body.email) {
              for (let k = 0; k < user[j].ordereditem.length; k++) {
                if (!user[j].ordereditem[k].productid && req.body.productname === user[j].ordereditem[k].productname) {
                  console.log(user[j].ordereditem[k].productname);
                  User.findOneAndUpdate({
                    _id: user[j]._id,
                    'ordereditem.productname': req.body.productname,
                    'ordereditem.productid': undefined,
                  },
                  {
                    $set: {
                      'ordereditem.$.productid': product[i]._id,
                      'ordereditem.$.description': product[i].description,
                      'ordereditem.$.photos': product[i].photos[0].path,
                      'ordereditem.$.caption': product[i].caption,
                      'ordereditem.$.price.costprice': product[i].price,
                      'ordereditem.$.price.quantity': req.body.quantity,
                      'ordereditem.$.price.totalprice': product[i].price * req.body.quantity,
                    }
                  })
                    .then(() => {
                      req.flash('info', { msg: 'Matched' });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }
              }
            }
          }
        });
      }
    }
  });
};

exports.postKhaltiVerification = (req, res) => {
  const data = {
    token: req.body.token,
    amount: req.body.amount
  };
  const config = {
    headers: {
      Authorization: 'Key test_secret_key_40a1bfc2225a454ab40677f6e367bc4a' // generate new secretkey for verification & publickey for client
    }
  };
  axios.post('https://khalti.com/api/v2/payment/verify/', data, config)
    .then((response) => {
      console.log(response.data);
      req.flash('success', { msg: 'Khalti payment successfull' });
    })
    .catch((error) => {
      console.log(error);
      req.flash('error', { msg: 'Khalti payment error' });
    });
};

exports.getEsewaVerification = (req, res) => {
  const params = req.url.split('/')[3];
  console.log(params);
  const urlString = `http://esewaverification${params}`; // window.location.href
  const url = new URL(urlString);
  const oid = url.searchParams.get('oid');
  const amt = url.searchParams.get('amt');
  const refId = url.searchParams.get('refId');
  console.log(oid);
  console.log(amt);
  console.log(refId);

  const data = {
    amt,
    rid: refId,
    pid: oid,
    scd: 'EPAYTEST',
  };
  axios.post('https://uat.esewa.com.np/epay/transrec', data)
    .then((response) => {
      console.log('on success');
      console.log(response);
    })
    .catch((error) => {
      console.log('on failure');
      console.log(error);
    });
};

exports.buyNow = async (req, res) => {
  const cart = [];
  const txAmt = 0;
  const psc = 0;
  const pdc = 0;
  const pid = uuidv4(); // unique id generator for database query
  let totalpurchase = 0;
  let totalcost = 0;
  let userdetails = {};
  if (!req.user) {
    const cartProductIds = req.session.cart.map(({ productid }) => productid);
    const products = await Product.find({ _id: { $in: cartProductIds } });

    products.forEach((product) => {
      const cartProduct = req.session.cart.find(({ productid }) => productid === product._id.toString());
      totalpurchase += cartProduct.totalprice;
      totalcost += cartProduct.totalprice + txAmt + psc + pdc;
      cartProduct.totalquantity = product.inventory[0].count;
      cart.push(cartProduct);
    });

    userdetails = {
      url: req.url,
      fname: '',
      lname: '',
      phone: '',
      location: '',
      nearby: '',
      city: '',
      email: '',
      totalcost,
      pid,
      txAmt,
      psc,
      pdc,
      totalpurchase
    };
  } else {
    if (req.url === '/buynow') {
      const cartProductIds = req.user.cart.map(({ productid }) => productid);
      const products = await Product.find({ _id: { $in: cartProductIds } });
      products.forEach((product) => {
        const cartProduct = req.user.cart.find(({ productid }) => productid === product._id.toString());
        totalcost += cartProduct.totalprice + txAmt + psc + pdc;
        totalpurchase += cartProduct.totalprice;

        cartProduct.totalquantity = product.inventory[0].count;
        cart.push(cartProduct);
      });
    } else if (req.url === '/booknow') {
      const {
        id, sku, productname, description, photos, caption, productprice, quantity
      } = req.body;

      cart.push({
        productid: id,
        sku,
        productname,
        description,
        photos,
        caption,
        price: productprice,
        quantity,
        totalprice: productprice * quantity
      });
    }

    const { email, userdetails: { firstname, lastname, phone }, address: { location, nearby, city } } = req.user;
    userdetails = {
      url: req.url,
      email,
      fname: firstname,
      lname: lastname,
      phone,
      location,
      nearby,
      city,
      psc,
      pdc,
      pid,
      txAmt,
      totalcost,
      totalpurchase,
    };
  }

  return res.render('order/user/buynow', {
    title: 'My cart',
    items: cart,
    paymentMethods: PaymentMethodChoices,
    userdetails
  });
};

exports.confirmOrder = async (req, res, next) => {
  req.assert('phone', 'Phone number must be 10 characters long').len(10, 10);
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/order/buynow');
  }

  const orderItems = [];
  if (!req.user) {
    // add to orderitem array
    for (let i = 0; i < req.session.cart.length; i++) {
      const {
        productid, productname, description, photos, caption, quantity, price, paymentmethod
      } = req.session.cart[i];
      const item = {
        _id: ObjectId(),
        productid,
        productname,
        description,
        photos,
        caption,
        paymentmethod,
        price: {
          quantity,
          costprice: price,
          totalprice: quantity * price,
        }
      };
      req.session.ordereditem.push(item);
      orderItems.push(item);
    }
    // remove from cart
    req.session.cart = [];
    res.redirect('/order/mycart');
  } else {
    try {
      const user = await User.findById(req.user.id);
      const userCart = req.user.cart;
      const { url: bodyUrl } = req.body;
      if (bodyUrl === 'buynow') {
        // added to ordereditem array of user
        for (let i = 0; i < userCart.length; i++) {
          const {
            productid, productname, description, photos, caption, quantity, price, paymentmethod
          } = user.cart[i];
          const item = {
            productid,
            productname,
            description,
            photos,
            caption,
            paymentmethod,
            price: {
              quantity,
              costprice: price,
              totalprice: quantity * price,
            }
          };
          orderItems.push(item);
          user.ordereditem.push(item);
        }

        user.cart = user.buylater;
        try {
          await user.save();
        } catch (err) {
          req.flash('errors', { msg: 'Something went wrong trying to save user data' });
          return res.redirect('/order/mycart');
        }

        try {
          await User.findOneAndUpdate({ _id: req.user.id }, {
            $set: {
              buylater: [],
            }
          },
          { multi: true });
        } catch (err) {
          return next(err);
        }
      } else if (bodyUrl === 'booknow') {
        const {
          productid, productname, description, photos, caption, quantity, costprice, paymentmethod
        } = req.body;
        const item = {
          productid,
          productname,
          description,
          photos,
          caption,
          paymentmethod,
          price: {
            quantity,
            costprice,
            totalprice: quantity * costprice,
          }
        };

        orderItems.push(item);
        user.ordereditem.push(item);

        try {
          await user.save();
          // req.flash('success', { msg: 'Your order is booked' });
          // return res.redirect('/order/mycart');
        } catch (err) {
          return next(err);
        }
      }
    } catch (err) {
      return next(err);
    }
  }

  // add to order collection
  Order.findOne({}, {}, { sort: { _id: -1 } }, async (err, order) => {
    if (err) {
      return next(err);
    }
    const products = [];
    for (let i = 0; i < orderItems.length; i++) {
      const {
        productid, productname, description, price: { costprice, quantity }, photos, caption
      } = orderItems[i];
      products.push({
        productid,
        name: productname,
        description,
        price: costprice,
        count: quantity,
        photos,
        caption,
        status: 'matched'
      });
    }

    try {
      const orderNum = !order ? 1000 : order.ordernum + 1;
      const {
        fname, lname, phone, email, location, nearby, city, paymentmethod
      } = req.body;
      const orderInstance = new Order({
        ordernum: orderNum,
        userdetails: {
          firstname: fname,
          lastname: lname,
          phone,
          email
        },
        delivery: {
          status: 'ordered',
          cost: 0,
        },
        address: { location, nearby, city },
        products,

        paymentmethod
      });
      await orderInstance.save();
    } catch (err) {
      console.log(err);
    }
  });

  // subtract from inventory
  try {
    const productIds = orderItems.map(({ productid }) => productid);
    const products = await Product.find({ _id: { $in: productIds } });
    const dates = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const today = new Date();

    products.forEach(async (product) => {
      const orderItem = orderItems.find(({ productid }) => productid === product._id.toString());
      const { price: { quantity } } = orderItem;
      product.inventory[0].count -= parseInt(quantity, 10);
      product.soldunits += parseInt(quantity, 10);
      if (product.sales.length > 0) {
        product.sales.forEach((sale) => {
          if (sale.year === today.getFullYear()) {
            for (let l = 0; l < 12; l++) {
              if (dates[l] === dates[today.getMonth()]) {
                if (sale.months[l]) {
                  sale.months[l] += parseInt(quantity, 10);
                }
              }
            }
          }
        });
      } else {
        product.sales = [{
          year: today.getFullYear(),
          months: { $mth: 0 }
        }];
      }

      try {
        await product.save();
      } catch (err) {
        console.log('- Err product.save(): ', err);
      }
    });
  } catch (err) {
    console.log('- Err Product.find(): ', err);
  }

  // email
  try {
    const receiver = req.body.email;
    const subject = 'Order Confirmation | Xinney Nepal';
    const text = "We've received your order and will contact you as soon as your package is shipped.";
    await mailer.sendCustomEmail(receiver, subject, text);
  } catch (err) {
    console.log('- confirmOrder email Err: ', err);
  }

  req.flash('success', { msg: 'Your order is successfully submitted' });
  return res.redirect('/order/myorder');
};
