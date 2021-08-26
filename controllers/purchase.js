/* eslint-disable no-unused-vars */
const ObjectId = require('mongodb').ObjectID;
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

const { getDropDownValues } = require('../helpers/productdropdown');
const { calculatePostPrices } = require('../helpers/pricecalculation');
const DropDown = require('../helpers/dropdown.json');

const mailer = require('../lib/mailer');
const Tracker = require('../models/Tracker');

function productFilter(req, resUpdates, err, type) {
  if (err) console.log(err);
  const purchaseId = resUpdates._id;
  const singleFormCount = req.body.formcount - 1;
  let names;
  let productCount;
  let locations;
  let productCostPrice;
  let wType;
  let wMain;
  let wSub;
  for (let i = 0; i < req.body.formcount; i++) {
    if (singleFormCount === 0) {
      names = req.body.name;
      productCount = req.body.count;
      locations = req.body.location;
      productCostPrice = req.body.costprice;
    } else {
      names = req.body.name[i];
      productCount = req.body.count[i];
      locations = req.body.location[i];
      productCostPrice = req.body.costprice[i];
    }

    wMain = req.body.weight[i * 2];
    wSub = req.body.weight[i * 2 + 1];
    if (singleFormCount === 0) wType = req.body.wtype;
    else wType = req.body.wtype[i];

    const calHref = {};
    calHref.wmain = req.body.weight[i * 2];
    calHref.wsub = req.body.weight[i * 2 + 1];

    if (singleFormCount === 0) {
      calHref.costprice = req.body.costprice;
      calHref.wtype = req.body.wtype;
    } else {
      calHref.costprice = req.body.costprice[i];
      calHref.wtype = req.body.wtype[i];
    }

    const { sellprice, totalcost } = calculatePostPrices(calHref, 0);

    if (type === 'add') {
      if (names.includes(':')) {
        const splitedid = names.split(':');
        const temp = splitedid[1];
        const ids = temp.slice(0, 24);

        const id = { _id: ObjectId(ids) };
        const newvalues = {
          $push: {
            inventory: [
              {
                count: parseInt(productCount, 10),
                location: locations,
                purchaseId,
              },
            ],
            purchase: [
              {
                count: parseInt(productCount, 10),
                purchaseperson: req.body.purchaseperson,
                location: locations,
                purchaseId,
                costprice: productCostPrice,
                purchase_date: req.body.purchasedate,
                totalcost,
                sellPrice: sellprice,
              }
            ],
          },
        };
        Product.findByIdAndUpdate(id, newvalues, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('inventory recorded');
          }
        });
      } else {
        const inventoryPreorder = [];
        const inventoryPreorderHref = {};
        inventoryPreorderHref.count = parseInt(productCount, 10);
        inventoryPreorderHref.location = locations;
        inventoryPreorderHref.purchaseId = purchaseId;
        inventoryPreorder.push(inventoryPreorderHref);

        const purchase = [];
        const { purchasedate, purchaseperson } = req.body;
        purchase.push({
          purchase_date: purchasedate,
          purchaseperson,
          count: parseInt(productCount, 10),
          location: locations,
          purchaseId,
          costprice: productCostPrice,
          sellPrice: sellprice,
          totalcost
        });

        const Preorderobj = new Product({
          name: names,
          wtype: wType,
          wmain: wMain,
          soldunits: 0,
          wsub: wSub,
          price: productCostPrice,
          producttype: 'Pre-purchase',
          inventory: inventoryPreorder,
          purchase,
        });

        Preorderobj.save((err) => {
          if (err) console.log(err);
          console.log('saved successfully');
        });
      }
    }

    if (type === 'update') {
      if (names.includes(':')) {
        const splitedid = names.split(':');
        const temp = splitedid[1];
        const ids = temp.slice(0, 24);

        const id = { _id: ObjectId(ids) };

        if (i === req.body.formcount - 1) {
          const newvalues = {
            $push: {
              inventory: [
                {
                  count: parseInt(productCount, 10),
                  location: locations,
                  purchaseId,
                },
              ],
              purchase: [
                {
                  count: parseInt(productCount, 10),
                  purchaseperson: req.body.purchaseperson,
                  location: locations,
                  purchaseId,
                  costprice: productCostPrice,
                  purchase_date: req.body.purchasedate,
                  sellPrice: sellprice,
                  totalcost,
                }
              ],
            },
          };
          Product.findByIdAndUpdate(id, newvalues, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('inventory recorded');
            }
          });
        }
      } else if (i === req.body.formcount - 1) {
        const inventoryPreorder = [];
        inventoryPreorder.push({
          count: parseInt(productCount, 10),
          location: locations,
          purchaseId
        });

        const purchase = [];
        const Preorderobj = new Product({
          name: names,
          soldunits: 0,
          wtype: wType,
          wmain: wMain,
          wsub: wSub,
          price: productCostPrice,
          producttype: 'Pre-purchase',
          inventory: inventoryPreorder,
          purchase,
        });

        Preorderobj.save((err) => {
          if (err) console.log(err);
          console.log('saved successfully');
        });
      }
    }
  }
}

function findVal(paymentType) {
  const paymentMethods = [
    { key: 'cash', value: 'Cash Payment' },
    { key: 'aciti', value: 'Amit Citibank Credit' },
    { key: 'adiscover', value: 'Amit Discover Credit' }
  ];
  const paymentMethod = paymentMethods.find((item) => paymentType === item.key);
  return paymentMethod ? paymentMethod.value : null;
}

exports.getAddPurchase = (req, res) => {
  const purHref = {
    DropDownPurchase: DropDown.purchase_type,
    DropDownLocation: DropDown.product_location,
    DropDownWeight: DropDown.weight_type,
    DropDownPurchaseMethod: DropDown.purchase_method
  };
  getDropDownValues(purHref);
  res.render('purchase/addpurchase', { purHref });
};

exports.getInventoryPurchaseForm = (req, res) => {
  Product.findById(req.params.id, (err) => {
    const prodAttr = {};
    if (err) {
      console.log(err);
      return err;
    }
    prodAttr.id = req.params.id;
    getDropDownValues(prodAttr);
    res.render('inventory/addpurchase', { prodAttr });
  });
};

exports.getCalculator = (_req, res) => {
  const calHref = {
    DropDownPurchase: DropDown.purchase_type,
    DropDownLocation: DropDown.product_location,
    DropDownWeight: DropDown.weight_type,
    DropDownPayMethod: DropDown.payment_method
  };
  getDropDownValues(calHref);
  res.render('calculator', { calHref });
};

exports.postCalculator = (req, res) => {
  const {
    wtype, mainweight, subweight, costprice
  } = req.body;
  const calHref = {
    wtype,
    wmain: mainweight,
    wsub: subweight,
    mainweight,
    subweight,
    costprice
  };

  const { sellprice, totalcost } = calculatePostPrices(calHref, 0);
  calHref.mainweight = mainweight;
  calHref.subweight = subweight;
  calHref.sellprice = sellprice;
  calHref.totalcost = totalcost;
  console.log('totalcost and sellprice');
  console.log(calHref);
  res.render('calculator', { calHref });
};

exports.postPurchaseForms = (req, res) => {
  const purHref = {
    DropDownPurchase: DropDown.purchase_type,
    DropDownLocation: DropDown.product_location,
    DropDownWeight: DropDown.weight_type,
    DropDownPayMethod: DropDown.payment_method,
    DropDownPurchaseMethod: DropDown.purchase_method

  };
  getDropDownValues(purHref);

  const href = req.body;
  const { formcount, costprice } = req.body;
  if (formcount && !costprice) {
    const {
      purchasedate, purchasetype, email, source, billid, paymethod, tax, totalamt, purchaseperson, notes, location
    } = req.body;
    purHref.formcount = formcount;
    purHref.purchasedate = purchasedate;
    purHref.type = purchasetype;
    purHref.source = source;
    purHref.email = email;
    purHref.billid = billid;
    purHref.paymentmethod = paymethod;
    purHref.tax = tax;
    purHref.totalamt = totalamt;
    purHref.purchaseperson = purchaseperson;
    purHref.notes = notes;
    purHref.locations = location;
    res.render('purchase/addpurchase', { purHref });
  } else {
    const products = [];
    for (let i = 0; i < req.body.formcount; i++) {
      const prodHref = {};
      if (req.body.formcount === 1) {
        prodHref.name = href.name;
      } else {
        prodHref.name = href.name[i];
      }
      if (req.body.formcount === 1) {
        prodHref.wtype = href.wtype;
      } else {
        prodHref.wtype = href.wtype[i];
      }
      prodHref.wmain = href.weight[i * 2];
      prodHref.wsub = href.weight[i * 2 + 1];
      if (req.body.formcount === 1) {
        prodHref.costprice = href.costprice;
      } else {
        prodHref.costprice = href.costprice[i];
      }
      if (req.body.formcount === 1) {
        prodHref.count = href.count;
      } else {
        prodHref.count = href.count[i];
      }
      const purchaseCalc = calculatePostPrices(prodHref, 0); // Discount is not used here
      prodHref["sellprice"] = purchaseCalc.sellprice || 0;
      prodHref["totalcost"] = purchaseCalc.totalcost || 0;
      products.push(prodHref);

    }
    const trackers = [];
    for (let i = 0; i < req.body.formcount; i++) {
      const trackerHref = {};
      if (req.body.formcount === 1) trackerHref.name = href.name;
      else trackerHref.name = href.name[i];
      if (req.body.formcount === 1) trackerHref.count = href.count;
      else trackerHref.count = href.count[i];
      trackerHref.dispatched_us = 'off';
      trackerHref.shipping = 'off';
      trackerHref.delivered_nepal = 'off';
      trackers.push(trackerHref);
    }
    const purchaseObj = new Purchase({
      date: href.purchasedate,
      type: href.purchasetype,
      source: href.source,
      email: href.email,
      billid: href.billid,
      paymentmethod: href.paymethod,
      tax: href.tax,
      totalamt: href.totalamt,
      person: href.purchaseperson,
      notes: href.notes,
      location: href.location,
      product: products,
      trackers,
    });

    purchaseObj.save((err, results) => {
      if (err) {
        console.log(err);
        req.flash('errors', {
          msg:
            'Product could not be submitted. Please fill out correct information',
        });
        res.redirect('addpurchase');
      } else {
        console.log('checking');
        console.log(results);

        const tracks = {
          trackID: results._id
        };
        const track = new Tracker(tracks);
        track.save((err) => {
          if (err) console.log('err');
          console.log('purchase track is made');
        });

        productFilter(req, results, err, 'add');
        req.flash('success', { msg: 'Purchase add was successful' });
        res.redirect('addpurchase');
      }
    });
  }
};

exports.getPurchaseList = (_req, res) => {
  Purchase.find({}, (_err, purchases) => {
    const items = [];
    for (let i = 0; i < purchases.length; i++) {
      const href = {};
      const purHref = purchases[i];
      if (purHref.date === null) {
        break;
      }
      const val = findVal(purHref.paymentmethod);
      console.log(val);
      href._id = purHref._id;
      href.source = purHref.source;
      href.purchaser = purHref.person;
      href.bill_id = purHref.billid;
      href.date = purHref.date.toISOString().substring(0, 10);
      href.payment = val;
      href.productcount = purHref.product.length;
      href.totalamt = purHref.totalamt;
      items.push(href);
    }
    res.render('purchase/purchaselist', { items });
  }).sort({ date: -1 });
};

exports.getEditPurchase = (req, res) => {
  const purHref = {};
  purHref.DropDownPurchase = DropDown.purchase_type;
  purHref.DropDownWeight = DropDown.weight_type;
  purHref.DropDownLocation = DropDown.product_location;
  purHref.DropDownPurchaseMethod = DropDown.purchase_method;

  getDropDownValues(purHref);
  Purchase.findById(req.params.id, (err, purchase) => {
    purHref._id = purchase._id;
    purHref.formcount = purchase.product.length + 1;
    purHref.purchasedate = purchase.date.toISOString().substring(0, 10);
    purHref.type = purchase.type;
    purHref.source = purchase.source;
    purHref.email = purchase.email;
    purHref.paymentmethod = purchase.paymentmethod;
    purHref.billid = purchase.billid;
    purHref.tax = purchase.tax;
    purHref.totalamt = purchase.totalamt;
    purHref.purchaseperson = purchase.person;
    purHref.notes = purchase.notes;
    purHref.product = purchase.product;
    purHref.locations = purchase.location;

    const weight = [];
    for (let i = 0; i < purchase.product.length; i++) {
      weight.push(purchase.product[i].wtype);
    }
    purHref.wtype = weight;
    const location = [];
    for (let i = 0; i < purchase.product.length; i++) {
      location.push(purchase.product[i].location);
    }
    purHref.location = location;
    const productDistinguisher = [];
    for (let i = 0; i < purchase.product.length; i++) {
      if (purchase.product[i].name.includes(':')) {
        const productName = purchase.product[i].name.split('/');
        productDistinguisher.push(productName[0]);
      } else {
        const productName = purchase.product[i].name;
        productDistinguisher.push(productName);
      }
    }
    console.log(productDistinguisher);
    purHref.prodName = productDistinguisher;
    res.render('purchase/editpurchase', { purHref });
  });
};

exports.purchaseDetails = (req, res) => {
  console.log('Checking th urls');
  console.log(req.originalUrl);
  const purchaseId = req.originalUrl.split('/')[3];
  const productId = req.originalUrl.split('/')[4];
  const productname = req.originalUrl.split('/')[5];
  const productcount = req.originalUrl.split('/')[6];
  const productcostprice = req.originalUrl.split('/')[7];
  console.log('Purchaseid is');
  console.log(purchaseId);
  console.log('product id is');
  console.log(productId);

  let productName;
  if (productname.includes(':')) {
    const [splitedProductName, ...rest] = productname.split(':');
    productName = splitedProductName;
  } else {
    productName = productname;
  }
  const id1 = { _id: ObjectId(purchaseId) };
  const id2 = { _id: ObjectId(productId) };
  const newvalues = {
    $pull: {
      product:
      {
        _id: id2,
      },
    },
  };
  Purchase.updateOne(id1, newvalues, (err, result) => {
    if (err) console.log(err);
    if (result) {
      const newvalues1 = {
        $pull:
        {
          inventory:
          {
            purchaseId: id1,
          },
          purchase:
          {
            purchaseId: id1,
          },
        },
      };
      Product.find({ name: productName }, (err, results) => {
        if (err) console.log(err);
        if (results) {
          Product.findByIdAndUpdate(ObjectId(results[0]._id), newvalues1, (err, succ) => {
            console.log(results[0]._id);
            if (err) console.log(err);
            if (succ) console.log('deleted successfully');
            const product = productname;
            const receiver = 'sanishmaharjan65@gmail.com';
            const subject = 'Product Delete Notification | Xinney Nepal';
            const text = `Hello Admin, product ${product} is deleted at ${Date()} <br>
              <table border = stripe>
                <tr>
                  <th>Product</th>
                  <th>PurchaseId</th>
                  <th>Count</th>
                  <th>Costprice</th>
                </tr>
                <tr>
                  <td>${product}
                  <td>${purchaseId}</td>
                  <td>${productcount}</td>
                  <td>${productcostprice}</td>
                </tr>
              </table>`;
            // eslint-disable-next-line consistent-return
            return mailer.sendCustomEmail(receiver, subject, text)
              .then(() => {
                req.flash('success', { msg: 'Product deleted successfully, email notified.' });
                res.redirect(`/purchase/purchaselist/${purchaseId}`);
              })
              .catch((err) => {
                console.log(err);
                req.flash('errors', { msg: 'It appears an error occured while sending email notification' });
                res.redirect(`/purchase/purchaselist/${purchaseId}`);
              });
          });
        }
      });
    }
  });
};

exports.updatePurchaseForm = (req, res) => {
  const storeFormCount = req.body.formcount;
  const product = [];
  Purchase.findById(req.params.id, (err) => {
    if (err) console.log(err);
    for (let i = 0; i < storeFormCount; i++) {
      const prodHref = {};
      prodHref.DropDownWeight = DropDown.weight_type;
      prodHref.DropDownPurchase = DropDown.purchase_type;
      prodHref.DropDownLocation = DropDown.product_location;
      prodHref.DropDownPayMethod = DropDown.payment_method;
      prodHref.DropDownPurchaseMetho = DropDown.purchase_method;


      prodHref.wmain = req.body.weight[i * 2];
      prodHref.wsub = req.body.weight[i * 2 + 1];
      if (storeFormCount === 1) {
        prodHref.costprice = req.body.costprice;
        prodHref.count = req.body.count;
        prodHref.name = req.body.name;
        prodHref.wtype = req.body.wtype;
        prodHref.location = req.body.location;
      } else {
        prodHref.costprice = req.body.costprice[i];
        prodHref.count = req.body.count[i];
        prodHref.name = req.body.name[i];
        prodHref.wtype = req.body.wtype[i];
        prodHref.location = req.body.location[i];
      }
      const purchaseCalc = calculatePostPrices(prodHref, 0); // Discount is not used here
      prodHref.sellprice = purchaseCalc.sellprice || 0;
      prodHref.totalcost = purchaseCalc.totalcost || 0;
      product.push(prodHref);
    }

    const purchaseHref = {
      date: req.body.purchasedate,
      type: req.body.purchasetype,
      source: req.body.source,
      email: req.body.email,
      paymentmethod: req.body.paymethod,
      billid: req.body.billid,
      tax: req.body.tax,
      totalamt: req.body.totalamt,
      person: req.body.purchaseperson,
      notes: req.body.notes,
      location: req.body.location,
      product,
    };

    Purchase.findByIdAndUpdate(req.params.id, purchaseHref, (err, results) => {
      if (err) {
        req.flash('errors', {
          msg: 'Update failed. Please contact your administrator',
        });
        res.redirect(req.params.id);
      } else {
        productFilter(req, results, err, 'update');

        req.flash('success', { msg: 'Updated  successfully' });
        res.redirect(req.params.id);
      }
    });
  });
};

exports.getSearchInventory = (req, res) => {
  res.render('purchase/addpurchase');
};

exports.getSearchProducts = (req, res) => {
  const regex = new RegExp(req.query.term, 'i');
  const products = Product.find({ name: { $regex: regex } }, {
    name: 1, _id: 1, price: 1, wtype: 1, wmain: 1, wsub: 1
  })
    .sort({ updated_at: -1 })
    .sort({ created_at: -1 })
    .limit(100);
  products.exec((err, data) => {
    console.log(data);
    const result = [];
    if (!err) {
      if (data && data.length && data.length > 0) {
        data.forEach((test) => {
          result.push(`${test.name}:${test._id}/${test.price}/${test.wtype}/${test.wmain}/${test.wsub}`);
        });
      }
      res.jsonp(result);
    }
  });
};
