const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Device = require('../models/Device');

// POST /api/users/devices - Додати пристрій до користувача
router.post('/devices', authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId є обов\'язковим' });
    }

    // Використовуємо $addToSet для уникнення дублювання
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { devices: deviceId } },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error adding device to user:', error);
    res.status(500).json({ message: 'Помилка при додаванні пристрою до користувача' });
  }
});

// GET /api/users/devices-list - Отримати пристрої користувача з вибраними полями
router.get('/devices-list', authMiddleware, async (req, res) => {
    try {
      // Припускаємо, що в Device збережено поле 'owner', яке посилається на користувача
      const devices = await Device.find({ owner: req.user._id })
        .select('serialNumber status createdAt'); // вибираємо потрібні поля
      res.status(200).json(devices);
    } catch (error) {
      console.error('Error retrieving user devices:', error.message);
      res.status(500).json({ message: 'Помилка при отриманні пристроїв' });
    }
});

module.exports = router;