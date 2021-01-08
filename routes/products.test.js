const app = require('../app');
const request = require('supertest');
const { query } = require('../lib/mysql');
const faker = require('faker');

describe('Get products', () => {
  const products = new Array(3).fill(1).map((_, i) => ({
    id: faker.random.uuid(),
    name: faker.commerce.productName(),
    price: Math.round(faker.random.number()),
    is_active: i % 2 === 0
  }));
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
//...
  it('Get inactive products', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    const inactiveProducts = products.filter(p => !p.is_active);
    expect(res.body.products.length).toBe(inactiveProducts.length);
    inactiveProducts.forEach(ip => {
      expect(res.body.products.find(p => p.id === ip.id)).toBeDefined();
    });
  });

  it('Get active products', async () => {
    const res = await request(app).get(`/products?isActive=true`);
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(products.length - 1);
  });
});

describe('Insert product', () => {

  const createProduct = { name: faker.commerce.productName(), price: +faker.commerce.price() };

  afterAll(async () => {
    await query(`DELETE FROM products WHERE id = '${createProduct.id}'`);
  })

  it('Bad new product input', async () => {
    const res = await request(app).post('/products').send({ name: '1' });
    expect(res.statusCode).toBe(400);
  });

  it('Insert product', async () => {
    const res = await request(app).post('/products').send(createProduct);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    createProduct.id = res.body.id
  });
})
