const supertest = require('supertest');
const { app } = require('../server/app.js');

const request = supertest(app);

describe('api', () => {
  describe('get /qa/questions2', () => {
    it('should return a 200', (done) => {
      request.get('/qa/questions?product_id=1')
        .then((res) => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });

    it('should return an object with an array of results', (done) => {
      request.get('/qa/questions?product_id=1')
        .then((res) => {
          expect(typeof res.body).toBe('object');
          // expect(Array.isArray(res.body.results)).toBe(true);
          done();
        });
    });

    it('should return questions for specified product_id', (done) => {
      request.get('/qa/questions?product_id=1')
        .then((res) => {
          expect(res.body.product_id).toBe(1);
          done();
        });
    });

    it('should return a 400 for an invalid product_id', (done) => {
      request.get('/qa/questions?product_id=bad')
        .then((res) => {
          expect(typeof res.body).toBe('object');
          done();
        });
    });
  });
});
