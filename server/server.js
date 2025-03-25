require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const mqtt = require('mqtt');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Підключення до бази даних
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// MQTT підключення
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log('✅ Підключено до MQTT брокера');
  mqttClient.subscribe('smart-bin/status');
});

mqttClient.on('message', (topic, message) => {
  console.log(`Отримано повідомлення: ${message.toString()}`);
  // Тут буде логіка обробки повідомлень
});

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