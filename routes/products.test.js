const app = require('../app');
const request = require('supertest');
const faker = require('faker');
const { query } = require('../lib/mysql');

describe('GET products', () => {
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

  it('Should return non active products', async () => {
    const res = await request(app).get('/products?isActive=false');
    expect(res.statusCode).toBe(200);
    const inactiveProducts = products.filter(p => !p.is_active);
    expect(res.body.products.length).toBe(inactiveProducts.length);
    inactiveProducts.forEach(ip => {
      expect(res.body.products.find(p => p.id === ip.id)).toBeDefined();
    });
  });

  it('Should return active products', async () => {
    const res = await request(app).get('/products?isActive=true');
    expect(res.statusCode).toBe(200);
    const activeProducts = products.filter(p => p.is_active);
    expect(res.body.products.length).toBe(activeProducts.length);
    activeProducts.forEach(ip => {
      expect(res.body.products.find(p => p.id === ip.id)).toBeDefined();
    });
  });
});

describe('POST product', () => {
  let createdProductId;

  afterAll(async () => {
    await query(`DELETE FROM products WHERE id = '${createdProductId}'`);
  });

  it('Should create a new product', async () => {
    const productInput = {
      name: faker.commerce.productName(),
      price: Math.round(faker.random.number()),
    }
    const res = await request(app).post('/products').send(productInput);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    createdProductId = res.body.id;
    const [product] = await query(`SELECT * FROM products WHERE id = '${createdProductId}'`);
    expect(product.name).toBe(productInput.name);
    expect(product.price).toBe(productInput.price);
    // expect(product).toEqual(expect.objectContaining(productInput));
  });

  it('Should fail - invalid input', async () => {
    const res = await request(app).post('/products').send({ name: 'name1' });
    expect(res.statusCode).toBe(400);
  });
});