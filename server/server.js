require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const dashboardController = require('./controllers/dashboardController');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const startDeviceStatusChecker = require('./utils/deviceStatusChecker');

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
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error(err); 
  res.status(500).json({
    message: 'Внутрішня помилка сервера',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Запуск перевірки статусу пристроїв
startDeviceStatusChecker(); 

// Запуск серверу
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});

module.exports = app;