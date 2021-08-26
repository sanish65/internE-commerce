const Product = require('../models/Product');
const Brand = require('../models/Brand');
const { calculatePostPrices } = require('../helpers/pricecalculation');
const { getDropDownValues } = require('../helpers/productdropdown');

function getProductPurchaseItems(req) {
  const {
    costprice, wttype, weight, purchasedate, purchaseperson, count, location, source, email, billid, paymenttype, cardused, notes
  } = req.body;
  const weightHref = {
    type: wttype,
    main: weight[0],
    sub: weight[1],
  };

  const discount = req.body.discount || 0;
  const priceHref = calculatePostPrices(costprice, weightHref, discount);
  const { sellprice, totalcost } = priceHref;
  return {
    date: purchasedate,
    weight: weightHref,
    price: {
      sellprice,
      discount,
    },
    person: purchaseperson,
    costprice,
    totalcost,
    count,
    location,
    source,
    email,
    billid,
    paymenttype,
    cardused,
    notes,
  };
}

// Design
exports.getProduct = (req, res) => {
  Product.findById(req.params.id, (err, result) => {
    if (err) throw err;
    const href = {};
    href.id = result.id;
    href.sku = result.sku;
    href.name = result.name;
    href.description = result.description;
    href.caption = result.caption;
    href.price = result.price;
    for (let i = 0; i < result.inventory.length; i++) {
      href.totalquantity = result.inventory[i].count;
    }

    href.photos = result.photos[0].path;
    res.render('product', {
      item: href,
    });
  });
};

exports.getAddProductForm = (req, res) => {
  Brand.find({}, (err, result) => {
    if (err) throw err;
    const prodAttr = {};
    const brandList = [];
    for (let i = 0; i < result.length; i++) {
      brandList.push(result[i].name);
    }

    prodAttr.brands = brandList;
    getDropDownValues(prodAttr);
    res.render('product/addproduct', { prodAttr });
  });
};

exports.getProductPurchaseForm = (req, res) => {
  Product.findById(req.params.id, (err, product) => {
    if (err) {
      console.log(err);
      return err;
    }
    getDropDownValues(product);
    res.render('product/addpurchase', { prodAttr: product });
  });
};

exports.getPurchaseHistory = (req, res) => {
  Product.findById(req.params.id, (err, product) => {
    if (err) {
      console.log(err);
      return err;
    }

    const allPurchases = [];
    let count = 1;
    for (let i = 0; i < product.purchase.length; i++) {
      const href = {};
      const hrefPurchase = product.purchase[i];
      href.no = count;
      href.id = hrefPurchase._id;
      href.date = hrefPurchase.date;
      href.costprice = hrefPurchase.costprice;
      href.sellprice = hrefPurchase.price.sellprice;
      href.count = hrefPurchase.count;
      allPurchases.push(href);
      count++;
    }

    res.render('product/purchasehistory', { items: allPurchases });
  });
};

exports.postProductPurchaseForm = (req, res, next) => {
  Product.findById(req.params.id, (err, product) => {
    const purchaseHref = getProductPurchaseItems(req);
    product.purchase.push(purchaseHref);
    console.log(product.inventory);
    for (let i = 0; i < product.inventory.length; i++) {
      const invenHref = product.inventory[i];
      if (invenHref.location === req.body.location) {
        product.inventory[i].count = parseInt(invenHref.count, 10) + parseInt(req.body.count, 10);
      }
    }

    product.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Product purchase has been updated.' });
      getDropDownValues(product);
      res.render('product/addpurchase', { prodAttr: product });
    });
  });
};

exports.listProducts = (req, res) => {
  Product.find({}, (err, result) => {
    if (err) throw err;
    const displaySet = [];
    let count = 1;
    for (let i = 0; i < result.length; i++) {
      const href = {};
      href.id = result[i]._id;
      href.no = count;
      href.name = result[i].name;

      const invenPurchase = result[i].purchase;
      const locations = {
        0: 'Ordered',
        1: 'US',
        2: 'Nepal'
      };

      const inventoryLoc = [];
      for (let j = 0; j < invenPurchase.length; j++) {
        const pHref = invenPurchase[j];
        inventoryLoc.push([pHref.count || locations[pHref.location]]);
      }
      href.purchases = inventoryLoc;
      displaySet.push(href);
      count++;
    }
    res.render('product/productlist', { items: displaySet });
  });
};

exports.postProduct = (req, res, next) => {
  const href = { style: 'default', url: req.body.image };

  const { count, location } = req.body;
  const inventory = { count, location };
  const purchaseHref = getProductPurchaseItems(req);
  const productInstance = new Product({
    sku: req.body.sku,
    name: req.body.name,
    description: req.body.description,
    color: req.body.color,
    brand: req.body.brand,
    type: req.body.type,
    category: req.body.category,
    inventory: [inventory],
    purchase: [purchaseHref],
    images: [href],
  });

  productInstance.save((err) => {
    if (err) {
      console.log(err);
      req.flash('errors', { msg: 'Your order could not be submitted. Please fill out correct information' });
      res.redirect('addproduct');
    } else {
      req.flash('success', { msg: 'Your order is sucessfully submitted' });
      res.redirect('addproduct');
    }
  });
};

exports.editProduct = (req, res) => {
  Product.findById(req.params.id, (err, product) => {
    if (err) {
      console.log(err);
      return err;
    }

    Brand.find({}, (err, result) => {
      if (err) throw err;
      const brandList = [];
      for (let i = 0; i < result.length; i++) {
        brandList.push(result[i].name);
      }

      product.brands = brandList;
      res.render('product/editproduct', { product });
    });
  });
};
