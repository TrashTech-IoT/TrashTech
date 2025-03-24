const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Публічні маршрути
router.post('/register', authController.register);
router.post('/login', authController.login);

// Захищені маршрути
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;