const AuthUserType = Object.freeze({
  admin: 'admin',
  customer: 'customer',
  moderator: 'moderator',
  investor: 'investor',
});

const AuthUserStatus = Object.freeze({
  active: 'Active',
  inactive: 'Inactive',
});

const WeightType = Object.freeze({
  lboz: 'Lb/oz',
  kggm: 'Kg/gm',
  ltml: 'Litre/ml'
});

const ProductLocation = Object.freeze({
  ordered: 'Ordered',
  us: 'Delivered in US',
  nepal: 'Delivered in Nepal',
});

const PurchaseType = Object.freeze({
  product: 'Product',
  subston: 'Subscription',
  misc: 'Miscellanous',
});

const PurchaseMethod = Object.freeze({
  cash: 'Cash Payment',
  aciti: 'Amit Citibank Credit',
  adiscover: 'Amit Discover Credit'
});

const PaymentMethodChoices = Object.freeze({
  cash: 'Cash On Delivery',
  esewa: 'Esewa',
  khalti: 'Khalti',
  bankDeposit: 'Bank Deposit',
  moneyTransfer: 'Money Transfer',
});

const DeliveryStatus = Object.freeze({
  ordered: 'Ordered',
  purchased: 'Purchased',
  deliveredUS: 'Delivered in US',
  deliveredKtm: 'Delivered in KTM',
  shippedUS: 'Shipped from US',
  shippedKtm: 'Shipped from Ktm',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
});

const ChannelStatus = Object.freeze({
  ordered: 'Purchase ordered',
  purchased: 'Purchased',
  Delivered_in_KTM: 'Delivered in Kathmandu',
  Delivered_in_US: 'Delivered in US',
  delivered: 'Purchase delivered',
  Nepal: 'Delivered in Nepal',
  US: 'Delivered in United States',
});

const ProductType = Object.freeze({
  inventory: 'Inventory',
  preOrdered: 'Pre-Ordered'
});

const FeatureType = Object.freeze({
  featured: 'featured',
  bestSeller: 'best-seller',
  promoted: 'promoted'
});

const MonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

module.exports = {
  AuthUserStatus,
  AuthUserType,
  WeightType,
  ProductLocation,
  PurchaseType,
  PurchaseMethod,
  PaymentMethodChoices,
  DeliveryStatus,
  ChannelStatus,
  ProductType,
  FeatureType,
  MonthNames
};
