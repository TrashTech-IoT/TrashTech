require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const { mqttClient } = require('./config/mqtt'); 
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Підключення до бази даних
connectDatabase();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_PORT,
  credentials: true
}));
app.use(express.json());

// Маршрути
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Внутрішня помилка сервера',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Запуск серверу
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});

module.exports = app;