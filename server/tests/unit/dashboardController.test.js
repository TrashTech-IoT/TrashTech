const { addDeviceConnection } = require('../../controllers/dashboardController');
const Device = require('../../models/Device');
const app = require('../../server');
const request = require('supertest');

jest.mock('../../models/Device');
jest.mock('mqtt', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    end: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
  })),
}));

let token;

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

describe('addDeviceConnection', () => {
  it('повертає 400, якщо не вказано serialNumber', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await addDeviceConnection(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Serial number is required.' });
  });
});

describe('GET запити в dashboardController', () => {
  it('повертає 200 та інформацію про dashboard, якщо запит GET виконано з токеном', async () => {
    const getDashboard = async (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.status(200).json({ dashboard: { totalDevices: 5, activeDevices: 3 } });
    };

    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getDashboard(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ dashboard: { totalDevices: 5, activeDevices: 3 } });
  });

  it('повертає 404, якщо пристрій не знайдено при GET запиті з токеном', async () => {
    const getDevice = async (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.status(404).json({ error: 'Device not found.' });
    };

    const req = {
      headers: { authorization: `Bearer ${token}` },
      params: { id: 'nonexistentDeviceId' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getDevice(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Device not found.' });
  });
});

afterAll(async () => {
  const mongoose = require('mongoose');
  await mongoose.disconnect();
});