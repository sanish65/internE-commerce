const request = require('supertest');
const app = require('../app');

describe('GET /login', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toEqual(200);
  });
});

// describe('GET /signup', () => {
//   it('should return 200 OK', (done) => {
//     request(app)
//       .get('/signup')
//       .expect(200, done);
//   });
// });
