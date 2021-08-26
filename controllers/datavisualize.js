const Product = require('../models/Product');
const User = require('../models/User');

exports.getCountData = (_req, res) => {
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
    res.jsonp(displaySet,);
  });
};

exports.getCountUser = (_req, res) => {
  const userDisplay = [];
  User.find({}, (err, user) => {
    if (err) throw err;
    let act = 0;
    let inact = 0;
    for (let i = 0; i < user.length; i++) {
      if (user[i].status === 'Active') {
        act++;
      } else {
        inact++;
      }
    }
    userDisplay.push(act, inact);
    res.jsonp(userDisplay);
  });
};
