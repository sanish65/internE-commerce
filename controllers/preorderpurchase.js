const Brand = require('../models/Brand');
const Product = require('../models/Product');
const DropDownValues = require('../helpers/productdropdown');
const { purchaseCalculations } = require('../helpers/pricecalculation');

exports.getPurchaseForm = (_req, res) => {
  Brand.find({}, (err, result) => {
    if (err) throw err;
    const prodAttr = {};
    const brandList = [];
    for (let i = 0; i < result.length; i++) {
      brandList.push(result[i].name);
    }
    prodAttr.brands = brandList;
    DropDownValues.getDropDownValues(prodAttr);
    res.render('preorder/orderpurchase', { prodAttr });
  });
};

exports.postPurchaseForm = (req, res) => {
  const purchaseHref = purchaseCalculations(req);
  const { name, link, brand } = req.body;
  const productInstance = new Product({
    name,
    url: link,
    brand,
    purchase: purchaseHref,
  });

  productInstance.save((err) => {
    if (err) {
      req.flash('errors', { msg: 'Your order could not be submitted. Please fill out correct information' });
      res.redirect('orderpurchase');
    } else {
      req.flash('success', { msg: 'Your purchase record is sucessfully submitted' });
      res.redirect('orderpurchase');
    }
  });
};
