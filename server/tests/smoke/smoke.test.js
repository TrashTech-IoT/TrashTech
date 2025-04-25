const request = require('supertest');
const app = require('../../server');
jest.mock('mqtt', () => ({
    connect: jest.fn(() => ({
      on: jest.fn(),
      end: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn(),
    })),
}));

describe('Smoke тест сервера', () => {
  let token;

  beforeAll(async () => {
    // Виконуємо логін існуючого користувача та отримуємо token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: "test@example.com",
        password: "123456"
      });
    expect(loginResponse.status).toBe(200);
    token = loginResponse.body.token;
  });

  it('GET /api/devices має повертати 200 з токеном', async () => {
    const response = await request(app)
      .get('/api/devices')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});

afterAll(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
});