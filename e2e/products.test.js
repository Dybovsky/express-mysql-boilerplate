const app = require('../app');
const request = require('supertest');
const faker = require('faker');
const { query } = require('../lib/mysql');

describe('Create and get products', () => {
  const product = {
    name: faker.commerce.productName(),
    price: Math.round(faker.random.number()),
  };

  afterAll(async () => {
    await query(`DELETE * FROM products WHERE id = '${product.id}'`);
  });

  it('Should create new product', async () => {
    const res = await request(app).post('/products').send(product);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    product.id = res.body.id;
  });

  it('Should get new created product', async () => {
    const res = await request(app).get('/products?isActive=false');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(1);
    const [resProduct] = res.body.products;
    expect(resProduct.name).toBe(product.name);
    expect(resProduct.price).toBe(product.price);
  });
})