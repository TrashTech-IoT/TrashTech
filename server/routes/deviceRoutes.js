const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const { createDevice, getDeviceInfo, deleteDevice, getAllDevices, addDeviceConnection,
  createDeviceWithoutOwner } = require('../controllers/deviceController');
const { authMiddleware, deviceAuth } = require('../middleware/auth');

// Route to create a new device
router.post('/device', authMiddleware, createDevice);

// Route to get device information by serial number
router.get('/device/:serialNumber', authMiddleware, getDeviceInfo);

router.delete('/device-delete', authMiddleware, deleteDevice);

router.patch('/device-add', authMiddleware, addDeviceConnection);

router.post('/device-squared', deviceAuth, createDeviceWithoutOwner);

router.get('/devices-all', authMiddleware, getAllDevices);

// GET /api/devices - Отримати всі пристрої (тільки для авторизованих користувачів)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const devices = await Device.find({  });
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при отриманні пристроїв' });
  }
});

// GET /api/devices/:id - Отримати один пристрій за ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const device = await Device.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Пристрій не знайдено' });
    }
    
    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при отриманні пристрою' });
  }
});

// POST /api/devices - Зареєструвати новий пристрій
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { deviceId, name, location } = req.body;
    
    // Перевірка, чи пристрій вже зареєстровано
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ message: 'Пристрій з таким ID вже зареєстровано' });
    }
    
    const newDevice = new Device({
      deviceId,
      name,
      location,
      user: req.user.id,
      status: 'offline',
      fillLevel: 0
    });
    
    const savedDevice = await newDevice.save();
    res.status(201).json(savedDevice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при створенні пристрою' });
  }
});

// PUT /api/devices/:id - Оновити інформацію про пристрій
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, location } = req.body;
    
    // Перевірка, чи належить пристрій користувачу
    const device = await Device.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Пристрій не знайдено' });
    }
    
    // Оновлення полів
    if (name) device.name = name;
    if (location) device.location = location;
    
    const updatedDevice = await device.save();
    res.json(updatedDevice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при оновленні пристрою' });
  }
});

// DELETE /api/devices/:id - Видалити пристрій
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({ 
      _id: req.params.id,
      user: req.user.id 
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Пристрій не знайдено' });
    }
    
    res.json({ message: 'Пристрій успішно видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при видаленні пристрою' });
  }
});

// POST /api/devices/heartbeat - Активність пристрою
router.post('/heartbeat', async (req, res) => {
  const { serialNumber } = req.body;

  if (!serialNumber) return res.status(400).json({ error: 'Serial number is required.' });

  const device = await Device.findOne({ serialNumber });
  if (!device) return res.status(404).json({ error: 'Device not found.' });

  device.status = 'online';
  device.lastActivity = new Date();
  await device.save();

  res.status(200).json({ message: 'Heartbeat received' });
});


module.exports = router;