require('../app');
const Product = require('../models/Product');

const addProduct = (data) => {
  try {
    const document = new Product({ ...data });
    return document.save();
  } catch (err) {
    console.log(`err${err}`);
  }
};

const getRandomItem = (itemArray = ['red', 'blue', 'green']) => itemArray[Math.floor(Math.random() * itemArray.length)];

const main = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      /* eslint-disable no-await-in-loop */
      const product = await addProduct({
        sku: `sku-${i}`,
        name: `product-${i}`,
        description: `Curabitur eros tellus, luctus nec diam eget, malesuada aliquet nunc. [product-${i}]`,
        color: getRandomItem(),
        brand: getRandomItem(['nivia', 'gillette', 'colgate']),
        type: getRandomItem([1, 2, 3]),
        category: getRandomItem(['makeup', 'cosmetics']),
        soldunits: getRandomItem([0, 1, 5]),
        price: getRandomItem([10, 20, 30, 40]),
        inventory: [{
          count: getRandomItem([0, 1, 5]),
          location: 'kathmandu',
          purchaseId: `purchaseId-${i}`
        }],
        purchase: [],
        photos: [
          { path: 'https://picsum.photos/100/100' },
          { path: 'https://picsum.photos/110/110' }
        ],
      });
      console.log('added product --', product);
    } catch (err) {
      console.log('- Err: ', err);
      process.exit(1);
    }
  }
  process.exit(0);
};

main();
