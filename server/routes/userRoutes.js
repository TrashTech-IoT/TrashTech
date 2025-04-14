const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Device = require('../models/Device');
const { changePassword, changeUsername } = require('../controllers/userController');

// POST /api/users/devices - Додати пристрій до користувача
router.post('/devices', authMiddleware, async (req, res) => {
  try {
    const { serialNumber } = req.body;
    if (!serialNumber) {
      return res.status(400).json({ message: "serialNumber є обов'язковим" });
    }

    // Знаходимо пристрій за серійним номером
    const foundDevice = await Device.findOne({ serialNumber });
    if (!foundDevice) {
      return res.status(404).json({ message: 'Пристрій не знайдено' });
    }

    // Додаємо _id пристрою до списку користувача
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { devices: foundDevice._id } },
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

router.post('/change-password', changePassword);
router.post('/change-username', changeUsername);

module.exports = router;