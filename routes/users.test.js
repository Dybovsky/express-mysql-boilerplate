const app = require('../app');
const request = require('supertest');
const { query } = require('../lib/mysql');
const faker = require('faker');

describe('Users endpoint', () => {

  const newUser = { email: faker.internet.email(), password: faker.internet.password() };
  let userId;

  afterAll(async () => {
    await query(`DELETE FROM users WHERE id = '${userId}'`);
  });

  it('Sign up', async () => {
    const res = await request(app).post('/users').send(newUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    userId = res.body.id;
  });

  it('Log in', async () => {
    const res = await request(app).post('/users/login').send(newUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
})
