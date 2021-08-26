const notifier = require('node-notifier');
const path = require('path');

const Brand = require('../models/Brand');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const {
  fileRead, categoryDisplayer, checkUncheckAssignment
} = require('../helpers/readcategoryfile');
const { getDropDownValues, setValue } = require('../helpers/productdropdown');
const { purchaseCalculations } = require('../helpers/pricecalculation');
const DropDown = require('../helpers/dropdown.json');
const checkMimeFunction = require('../helpers/checkMimeFunction');

exports.getAddInventoryProduct = (req, res) => {
  Brand.find({ type: 'inventory' }, (err, result) => {
    if (err) throw err;
    const prodAttr = {};
    const brandList = [];
    for (let i = 0; i < result.length; i++) {
      brandList.push(result[i].name);
    }

    prodAttr.brands = brandList;
    const allCategories = fileRead();
    const idNameCarrier = {};
    const rootCategories = allCategories['1:default'];
    categoryDisplayer(rootCategories, idNameCarrier);
    prodAttr.categories = rootCategories;
    prodAttr.idnames = idNameCarrier;
    prodAttr.DropDownWeight = DropDown.weight_type;
    prodAttr.DropDownProductType = DropDown.product_type;
    prodAttr.DropDownFeatureType = DropDown.feature_type;
    getDropDownValues(prodAttr);
    res.render('inventory/addinventory', { prodAttr });
  });
};

exports.getInventoryPurchaseHistory = (req, res) => {
  Product.findById(req.params.id, (err, product) => {
    if (err) {
      console.log(err);
      return err;
    }

    const allPurchases = [];
    let count = 1;
    for (let i = 0; i < product.purchase.length; i++) {
      const {
        _id, purchase_date: purchaseDate, costprice, purchaseperson, sellPrice, totalcost, count: purchaseCount, location: purchaseLocation
      } = product.purchase[i];
      allPurchases.push({
        no: count,
        id: _id,
        date: purchaseDate,
        costprice,
        purchaseperson,
        sellPrice,
        totalcost,
        count: purchaseCount,
        location: purchaseLocation,
        product_id: product._id
      });
      count++;
    }
    res.render('inventory/purchasehistory', { items: allPurchases });
  }).sort({ datefield: 1 });
};

exports.postProductPurchaseForm = (req, res, next) => {
  Product.findById(req.params.id, (err, product) => {
    const purchaseHref = purchaseCalculations(req);
    product.purchase.push(purchaseHref);
    for (let i = 0; i < product.inventory.length; i++) {
      const invenHref = product.inventory[i];
      if (invenHref.location === req.body.location) {
        product.inventory[i].count = parseInt(invenHref.count, 10) + parseInt(req.body.count, 10);
      }
    }

    product.save((err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Product purchase has been updated.' });
      res.redirect(product._id);
    });
  });
};

exports.getEditPurchase = (req, res) => {
  const productId = req.originalUrl.split('/')[3];
  const purchaseId = req.params.id;
  Product.findById(productId.trim(), (err, product) => {
    const purchaseAttr = {};
    purchaseAttr.product_id = productId;
    if (err) {
      console.log(err);
      return err;
    }

    for (let i = 0; i < product.purchase.length; i++) {
      const href = product.purchase[i];
      if (href._id === purchaseId) {
        purchaseAttr.id = req.params.id;
        purchaseAttr.date = href.purchasedate.toISOString().substring(0, 10);
        purchaseAttr.wtypedbkey = href.weight.type;
        purchaseAttr.wtypedb = setValue(href.weight.type, 'weight_type');
        purchaseAttr.locationdbkey = href.location;
        purchaseAttr.locationdb = setValue(href.location, 'product_location');
        purchaseAttr.weightmain = href.weight.main;
        purchaseAttr.weightsub = href.weight.sub;
        purchaseAttr.sellprice = href.price.sellprice;
        purchaseAttr.discount = href.price.discount;
        purchaseAttr.costprice = href.costprice;
        purchaseAttr.totalcost = href.totalcost;
        purchaseAttr.count = href.count;
        purchaseAttr.source = href.source;
        purchaseAttr.email = href.email;
        purchaseAttr.billid = href.billid;
        purchaseAttr.paymenttypedbkey = href.paymenttype;
        purchaseAttr.paymenttypedb = setValue(href.paymenttype, 'paymenttype');
        purchaseAttr.cardusedkey = href.cardused;
        purchaseAttr.cardused = setValue(href.cardused, 'cards');
        purchaseAttr.notes = href.notes;
      }
    }

    getDropDownValues(purchaseAttr);
    res.render('inventory/editpurchase', { prodAttr: purchaseAttr });
  });
};

exports.postEditPurchase = (req, res) => {
  const productId = req.originalUrl.split('/')[3];
  const purchaseId = req.params.id;
  Product.findById(productId.trim(), (err, product) => {
    if (err) {
      console.log(err);
      return err;
    }

    for (let i = 0; i < product.purchase.length; i++) {
      const href = product.purchase[i];
      if (href._id === purchaseId) {
        Object.assign(href, purchaseCalculations(req));
      }
    }

    product.save((err) => {
      if (err) {
        console.log(err);
        req.flash('errors', {
          msg:
            'Product could not be submitted. Please fill out correct information',
        });
        res.redirect('editpurchase');
      } else {
        req.flash('success', { msg: 'Prouct purchase updated successfully' });
        res.redirect(purchaseId);
      }
    });
  });
};

exports.listProducts = (req, res) => {
  Product.find({}, (err, result) => {
    if (err) throw err;
    const displaySet = [];
    const allCategories = fileRead();
    const defaultBranch = allCategories.default;
    let sno = 1;
    let count = 0;
    for (let i = 0; i < result.length; i++) {
      const {
        _id, sku, name, brand, producttype, inventory
      } = result[i];
      const href = {
        id: _id,
        sno,
        name,
        brand,
        producttype
      };
      if (producttype === 'Pre-purchase' && sku === undefined) {
        count++;
      }

      let totalInvCount = 0;
      for (let idx = 0; idx < inventory.length; idx++) {
        const invRef = inventory[idx];
        totalInvCount += invRef.count;
      }

      href.inventorycount = totalInvCount;
      href.categories = defaultBranch;
      displaySet.push(href);
      sno++;
    }
    if (count !== 0) {
      notifier.notify({
        icon: path.join(__dirname, '../public/xinney_black.png'),
        title: 'Xinney',
        message: `${count} Pre-purchase Product needs  your immediate review `,
        sound: true,
        wait: true
      }, () => { });
    }

    res.render('inventory/productlist', { items: displaySet });
  });
};

exports.postInventoryProduct = (req, res, next) => {
  const { count, location } = req.body;
  const inventory = { count, location };

  const fullPath = [];
  for (let i = 0; i < req.files.length; i++) {
    const href = {};
    href.path = `/files/inventory/${req.files[i].filename}`;
    fullPath.push(href);
  }
  const purchase = [];
  const purchaseHref = {};
  purchaseHref.count = req.body.count;
  purchaseHref.location = req.body.location;
  purchaseHref.purchase_date = Date();

  purchase.push(purchaseHref);

  const {
    sku, name, description, color, brand, link, type,
    caption, wtype, weight, price, producttype, featuretype, category_ids_names: categoryNames
  } = req.body;
  const prod = new Product({
    sku,
    name,
    color,
    brand,
    description,
    type,
    inventory: [inventory],
    link,
    purchase,
    photos: fullPath,
    caption,
    soldunits: 0,
    wtype,
    wmain: weight[0],
    wsub: weight[1],
    price,
    producttype,
    featuretype,
    category: categoryNames
  });

  const { flag, fileType } = checkMimeFunction(req);

  if (req.files.length <= 0) {
    req.flash('errors', {
      msg: 'Image is a mandatory,please select atleast 2 images',
    });
    res.redirect('addinventory');
  } else if (req.body.weight[0] === 0 && req.body.weight[1] === 0) {
    req.flash('errors', {
      msg:
        'Product could not be submitted. Both mainweight and subweight can not be 0',
    });
    res.redirect('addinventory');
  } else if (flag === 1) {
    req.flash('errors', {
      msg: `Sorry, we dont accept .${fileType} file format`,
    });
    res.redirect('addinventory');
  } else {
    prod.save((error) => {
      if (error) {
        req.flash('errors', {
          msg: 'Product could not be submitted. Please fill out correct information',
        });
        res.redirect('addinventory');
      } else {
        req.flash('success', { msg: 'Product is sucessfully added' });
        res.redirect('addinventory');
      }
    });
  }
};

exports.editInventory = (req, res) => {
  Product.findById(req.params.id, (err, product) => {
    if (err) {
      console.log(err);
      return err;
    }

    if ((product.sku === undefined) && (product.producttype === 'Pre-purchase')) {
      Brand.find({ type: 'inventory' }, (err, result) => {
        if (err) throw err;
        const brandList = [];
        for (let i = 0; i < result.length; i++) {
          brandList.push(result[i].name);
        }

        product.brands = brandList;
        const allCategories = fileRead();
        const idNameCarrier = {};
        const rootCategories = allCategories['1:default'];
        categoryDisplayer(rootCategories, idNameCarrier);
        product.categories = rootCategories;
        product.idnames = idNameCarrier;
        product.DropDownWeight = DropDown.weight_type;
        product.DropDownProductType = DropDown.product_type;
        product.DropDownFeatureType = DropDown.feature_type;
        product.DropDownProductType = DropDown.product_type;
        product.DropDownWeight = DropDown.weight_type;
        getDropDownValues(product);
        res.render('inventory/editinventory', {
          product,
        });
      });
    } else {
      Brand.find({}, (err, result) => {
        if (err) throw err;
        const brandList = [];
        for (let i = 0; i < result.length; i++) {
          brandList.push(result[i].name);
        }

        product.brands = brandList;
        const categoriesFromFile = fileRead();
        const idNameCarrier = {};
        const rootCategories = categoriesFromFile['1:default'];
        const productCategoriesDb = product.category;
        const prodCatRef = {};
        for (let i = 0; i < productCategoriesDb.length; i++) {
          prodCatRef[productCategoriesDb[i]] = 1;
        }

        const checker = {};
        checkUncheckAssignment(rootCategories, prodCatRef, idNameCarrier, checker);
        product.categories = rootCategories;
        product.idnames = idNameCarrier;
        product.checker = checker;
        product.DropDownProductType = DropDown.product_type;
        product.DropDownWeight = DropDown.weight_type;
        product.DropDownFeatureType = DropDown.feature_type;

        getDropDownValues(product);

        res.render('inventory/editinventory', { product });
      });
    }
  });
};

exports.updateInventory = (req, res, next) => {
  const { flag, fileType } = checkMimeFunction(req);

  if (flag === 1) {
    req.flash('errors', { msg: `sorry, we dont accept .${fileType} file types` });
    res.redirect(req.params.id);
  } else {
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        console.log(err);
        return err;
      }
      const fullPath = [];
      if (req.files.length) {
        for (let i = 0; i < req.files.length; i++) {
          const href = {};
          href.path = `/files/inventory/${req.files[i].filename}`;
          fullPath.push(href);
        }
      } else {
        for (let i = 0; i < product.photos.length; i++) {
          const href = {};
          href.path = product.photos[i].path;
          fullPath.push(href);
        }
      }

      const {
        sku: requestBodySku,
        name, description, color, brand, category_ids_names: categoryIdNames,
        caption, link, wtype, weight, price, producttype, featuretype
      } = req.body;
      product.sku = requestBodySku || product.sku;
      product.name = name;
      product.description = description;
      product.color = color;
      product.brand = brand;
      product.category = categoryIdNames;
      product.caption = caption;
      product.link = link;
      product.photos = fullPath;
      product.wtype = wtype;
      const [requestBodyWmain, requestBodyWsub] = weight;
      product.wmain = requestBodyWmain;
      product.wsub = requestBodyWsub;
      product.price = price;
      product.producttype = producttype;
      product.featuretype = featuretype;

      product.save((err) => {
        if (err) return next(err);

        if (!fullPath) {
          req.flash('errors', {
            msg: 'Image is a mandatory,please select atleast 2 images',
          });
          res.redirect(product._id);
        } else {
          req.flash('success', { msg: 'Product has been updated' });
          res.redirect(product._id);
        }
      });
    });
  }
};

exports.getProductTrackerInfo = (req, res) => {
  const displayInfo = [];
  const { id } = req.params;
  Purchase.findById(id, (err, info) => {
    if (err) throw err;
    const {
      location, product, trackers, report, person
    } = info;
    displayInfo.push({
      id,
      status: location,
      product,
      trackers,
      report,
      purchaser: person
    });
    res.render('producttracker/productInfo', { tracks: displayInfo });
  });
};

exports.getProductTracker = (req, res) => {
  Purchase.find({}, (err, result) => {
    if (err) throw err;
    const tracks = [];
    let sno = 1;
    for (let i = 0; i < result.length; i++) {
      const { _id, billid, date } = result[i];
      tracks.push({
        id: _id,
        billid,
        sno,
        date
      });
      sno++;
    }
    res.render('producttracker/trackinglist', { tracks });
  });
};

exports.getAllVerified = (req, res) => {
  const { id: requestParamsId } = req.params;
  Purchase.findById(requestParamsId, (_err, result) => {
    for (let i = 0; i < result.trackers.length; i++) {
      result.trackers[i] = {
        dispatched_us: 'on',
        shipping: 'on',
        delivered_nepal: 'on'
      };
    }

    result.save((err) => {
      if (err) throw err;
      console.log('All verified');
    });
  });

  res.redirect(`/producttracker/trackinglist/${requestParamsId}`);
};

exports.getProductTrackIndividualStatus = (req, res) => {
  const id = req.originalUrl.substr(29, 52).split('/')[0];

  Purchase.findById(req.params.id, (err, results) => {
    if (err) console.log(err);

    for (let i = 0; i < results.trackers.length; i++) {
      const {
        name, sample1, sample2, sample3
      } = req.body;
      if (results.trackers[i].name === name) {
        results.trackers[i] = {
          name,
          dispatched_us: sample1 || 'off',
          shipping: sample2 || 'off',
          delivered_nepal: sample3 || 'off'
        };
      }
    }

    results.save((err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log('successfully updated the trackings');
  });
  res.redirect(`/producttracker/trackinglist/${id}`);
};

exports.postTrackerIssues = ((req, res) => {
  const { id: requestParamsId } = req.params;
  const newvalues = {
    $push: {
      report: [
        {
          date: new Date(),
          issue: req.body.reportname,
          description: req.body.reportdescription,
        },
      ],
    }
  };
  Purchase.findByIdAndUpdate(requestParamsId, newvalues)
    .then(() => {
      console.log('issue entry done');
    })
    .catch((err) => {
      console.log(err);
    });

  Purchase.findById(requestParamsId, (err) => {
    if (err) console.log(err);
    res.redirect(`/producttracker/trackinglist/${requestParamsId}`);
  });
});
