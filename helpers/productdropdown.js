const Dropdown = require('./dropdown.json');

const getDropDownValues = (purHref) => {
  purHref.wtype = Dropdown.weight_type;
  purHref.prodloc = Dropdown.product_location;
  purHref.paymethod = Dropdown.payment_method;
  purHref.purtype = Dropdown.purchase_type;
  purHref.delivtype = Dropdown.channel_status;
};

const setValue = (key, dropdownType) => {
  const typeHref = Dropdown[dropdownType];
  let valueForKey;
  for (let i = 0; i < typeHref.length; i++) {
    const href = typeHref[i];
    if (href[key]) {
      valueForKey = href[key];
    }
  }

  return valueForKey;
};

module.exports = {
  getDropDownValues,
  setValue
};
