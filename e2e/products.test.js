const app = require('../app');
const request = require('supertest');
const { query } = require('../lib/mysql');
const faker = require('faker');

describe('Create and get products', () => {
  const createProduct = { name: faker.commerce.productName(), price: +faker.commerce.price() };

  afterAll(async () => {
    await query(`DELETE FROM products WHERE id = '${createProduct.id}'`);
  });

  it('Insert product', async () => {
    const res = await request(app).post('/products').send(createProduct);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    createProduct.id = res.body.id
  });

  it('Get non active products', async () => {
    const res = await request(app).get(`/products?isActive=false`);
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].id).toEqual(createProduct.id);
  });
});
