/* eslint-disable no-unused-vars */

// Discount is useful in customer order case but not with purchase
function calculatePostPrices(pHref, discount) {
  const weightType = pHref.wtype;
  const mainWeight = pHref.wmain || 0;
  const subWeight = pHref.wsub || 0;

  const costp = pHref.costprice;
  const totaldiscount = discount || 0;
  let weightInLb = 0;
  const extraWeight = 0.2; // this is in oz
  switch (weightType) {
    case 'lboz':
      weightInLb = parseFloat(mainWeight) + parseFloat(subWeight * 0.0625); // lb/oz
      break;
    case 'kggm':
      weightInLb = parseFloat(mainWeight) * 2.20462 + parseFloat(subWeight * 0.035274); // kg/gm
      break;
    case 'ltml':
      weightInLb = parseFloat(mainWeight) * 2.2 + parseFloat(subWeight * 0.033814); // lit/ml
      break;
    default:
      weightInLb = -1000000000; // Just to make sure some wrong number do not get publish
  }

  const cpWithTax = parseFloat(costp) + parseFloat(costp) * 0.15;
  const shippingCostPerLb = 8;
  const totalShippingCost = (parseFloat(weightInLb) + extraWeight) * shippingCostPerLb;
  const totalCost = parseFloat(cpWithTax) + parseFloat(totalShippingCost) + 1.5;

  const marginRange = [
    [10, 45],
    [15, 35],
    [20, 25],
    [25, 20],
    [30, 18],
    [35, 16],
    [40, 14],
    [45, 12],
    [5000000000, 10],
  ];

  let marginPercent = -100000000; // If the value cannot be find. Use this value so we realise the bug.
  marginRange.forEach(([itemPrice, itemMarginPercent, ...rest]) => {
    if (totalCost <= itemPrice) {
      marginPercent = itemMarginPercent;
    }
  });

  const sellPriceinDollar = parseFloat(totalCost) + parseFloat(marginPercent) * 0.01 * parseFloat(totalCost);
  let sellPriceInRs = parseInt(sellPriceinDollar, 10) * 114 - parseFloat(totaldiscount);
  const sellPriceInRsString = sellPriceInRs.toString();
  const last2Digits = sellPriceInRsString.substr(sellPriceInRsString.length - 2);
  const offset = parseInt(last2Digits, 10) < 50
    ? 50 - parseInt(last2Digits, 10)
    : 100 - parseInt(last2Digits, 10);
  sellPriceInRs += parseInt(offset, 10) - 1;
  return {
    totalcost: totalCost,
    sellprice: sellPriceInRs
  };
}

const purchaseCalculations = (req) => {
  const { costprice } = req.body;
  const discount = req.body.discount || 0;
  const { wtype, weight } = req.body;
  const weightHref = {
    type: wtype,
    main: weight[0],
    sub: weight[1],
  };

  const priceHref = calculatePostPrices(costprice, weightHref, discount);
  const { sellprice, totalcost } = priceHref;
  const {
    purchasedate, purchaseperson, count, location, source, email, billid, paymenttype, cardused, notes
  } = req.body;
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
};

module.exports = {
  purchaseCalculations,
  calculatePostPrices
};
