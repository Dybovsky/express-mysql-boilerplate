const app = require('../app');
const request = require('supertest');
const { query } = require('../lib/mysql');
const faker = require('faker');
const products = new Array(3).fill(1).map((_, i) => ({
  id: faker.random.uuid(),
  name: faker.commerce.productName(),
  price: Math.round(faker.random.number()),
  is_active: i % 2 === 0
}));

describe('Products endpoint', () => {
  beforeAll(async () => {
    const productValues = products
      .map(p => `('${p.id}', '${p.name}', ${p.price}, ${p.is_active})`)
      .join(', ');
    const sql = `INSERT INTO products (id, name, price, is_active) VALUES ${productValues}`;
    await query(sql);
  });

  afterAll(async () => {
    const ids = products.map(p => `'${p.id}'`).join(',');
    await query(`DELETE FROM products WHERE id IN (${ids})`);
  });

  it('Get all products', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(products.length - 1);
  });

  const createProduct = { name: faker.commerce.productName(), price: +faker.commerce.price() };

  it('Insert product', async () => {
    const res = await request(app).post('/products').send(createProduct);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    await query(`DELETE FROM products WHERE id = '${res.body.id}'`);
  });
})
