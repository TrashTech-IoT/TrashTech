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

let token;

describe('PATCH /api/dashboard/device-add', () => {

    beforeAll(async () => {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: "test@example.com",
            password: "123456"
          });
        expect(loginResponse.status).toBe(200);
        token = loginResponse.body.token;
    });

    it('повинно повертати 401 зі сповіщенням про неавторизований пристрій, якщо DEVICE_SECRET неправильний', async () => {
        const response = await request(app)
            .patch('/api/dashboard/device-add')
            .set('x-device-secret', 'wrong_secret')
            .set('Authorization', `Bearer ${token}`)
            .send({ serialNumber: 'Test123' });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized device');
    });

    it('повинно повертати 200, якщо DEVICE_SECRET вірний і payload містить serialNumber', async () => {
        // Використовуємо значення секрету із середовища або тестове значення
        const validSecret = process.env.DEVICE_SECRET;
        const response = await request(app)
            .patch('/api/dashboard/device-add')
            .set('x-device-secret', validSecret)
            .set('Authorization', `Bearer ${token}`)
            .send({ serialNumber: 'trashcan' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
    });

    it('повинно повертати 400, якщо DEVICE_SECRET вірний, але serialNumber не вказано', async () => {
        const validSecret = process.env.DEVICE_SECRET;
        const response = await request(app)
            .patch('/api/dashboard/device-add')
            .set('x-device-secret', validSecret)
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Serial number is required.');
    });
});

afterAll(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
});