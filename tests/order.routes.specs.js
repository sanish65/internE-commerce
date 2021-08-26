// checking the get and post urls and routes related to every order

const request = require('supertest');
const app = require('../app');

describe('GET /order/mycart', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/order/mycart');
    expect(res.statusCode).toEqual(200);
  });
});

describe('POST /order/buynow', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .post('/order/buynow')
      .expect(200, done);
  });
});

describe('POST /order/confirmation', () => {
  it('should return confirmation 302 OK', (done) => {
    request(app)
      .post('/order/confirmation')
      .expect(302, done);
  });
});

describe('POST /order/removecart/:id', () => {
  it('should remove order from cart 302 OK', (done) => {
    request(app)
      .post('/order/removecart/:id')
      .expect(302, done);
  });
});

describe('POST /order/removecart/:id', () => {
  it('should remove order from cart 302 OK', (done) => {
    request(app)
      .post('/order/removecart/:id')
      .expect(302, done);
  });
});

describe('POST /order/buylater/:id', () => {
  it('should redirect the buylater with sattus code 302', (done) => {
    request(app)
      .post('/order/buylater/:id')
      .expect(302, done);
  });
});

describe('POST /order/booknow', () => {
  it('should book the product with status code 302', (done) => {
    request(app)
      .post('/order/booknow')
      .expect(302, done);
  });
});

describe('POST /order/booknow', () => {
  it('should book the product with status code 302', (done) => {
    request(app)
      .post('/order/booknow')
      .expect(302, done);
  });
});

describe('get /order/list', () => {
  it('should get the orderlist with status code 302', (done) => {
    request(app)
      .get('/order/list')
      .expect(302, done);
  });
});

describe('get /order/editorder/:id', () => {
  it('should get the edit orderpages ', (done) => {
    request(app)
      .get('/order/editorder/:id')
      .expect(302, done);
  });
});
describe('get /order/createbilltemplate/:id', () => {
  it('should render create bill pages', (done) => {
    request(app)
      .get('/order/createbilltemplate/:id')
      .expect(302, done);
  });
});

describe('get /order/createbilltemplate/red/:id', () => {
  it('should render the billing page', (done) => {
    request(app)
      .get('/order/createbilltemplate/red/:id')
      .expect(302, done);
  });
});
