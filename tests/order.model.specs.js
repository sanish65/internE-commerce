const { expect } = require('chai');
const sinon = require('sinon');

const Order = require('../models/Order');

describe('Order Model', () => {
  it('should create new order placement', (done) => {
    const OrderMock = sinon.mock(new Order({
      _id: '60a503764273d503f334f37e',
      ordernum: '1009'
    }));
    const order = OrderMock.object;

    OrderMock
      .expects('save')
      .yields(null);

    order.save((err) => {
      OrderMock.verify();
      OrderMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('makes order validation false if wrong entry is placed', (done) => {
    const OrderMock = sinon.mock(new Order({
      _id: '60a503764273d503f334f37e',
      ordernum: 1000,
      userdetails: {
        firstname: 'sanish',
        lastname: 'maharjan',
        phone: 9876543210.0,
        email: 'sans@gmail.com'
      },
      delivery: {
        status: 'ordered',
        cost: 0
      },
      address: {
        location: '',
        nearby: '',
        city: ''
      },
      products: [
        {
          _id: '60a503764273d503f334f37f',
          productid: '60a4dedfa0952f00293654a3',
          name: 'Product2',
          description: 'Product2',
          price: 2000,
          photos: '/files/inventory/1621418161702-xinney-product-3.jpg',
          caption: '',
          count: 1,
          status: 'matched'
        }
      ],
      paymentmethod: 'cash',
    }));
    const order = OrderMock.object;
    const expectedError = {
      name: 'ValidationError',
    };

    OrderMock
      .expects('save')
      .yields(expectedError);

    order.save((err, result) => {
      OrderMock.verify();
      OrderMock.restore();
      expect(err.name).to.be.equal('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });
});
