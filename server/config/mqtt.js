require('dotenv').config();
const mqtt = require('mqtt');
const Device = require('../models/Device');

// Конфігурація MQTT клієнта
const mqttOptions = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `smart-bin-server-${Math.random().toString(16).substring(2, 8)}`,
  clean: true,
  reconnectPeriod: 5000,
  port: 8883,
};

// Створення MQTT клієнта
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, mqttOptions);

// Обробники подій MQTT
mqttClient.on('connect', () => {
  console.log('✅ Підключено до MQTT брокера (HiveMQ)');
  
  // Підписка на теми fill_level та detecting
  mqttClient.subscribe('fill_level', { qos: 0 });
  mqttClient.subscribe('detecting', { qos: 0 });
  
  console.log('✅ Підписано на теми fill_level та detecting');
});

mqttClient.on('message', async (topic, message) => {
  console.log(`📩 Отримано повідомлення з теми ${topic}: ${message.toString()}`);
  
  try {
    // Парсимо ID пристрою з топіку (формат: smart-bin/{serialNumber}/...)
    const topicParts = topic.split('/');
    if (topicParts.length < 3) return;
    
    const serialNumber = topicParts[1];
    const messageType = topicParts[2];
    
    // Знаходимо пристрій за серійним номером
    const device = await Device.findOne({ serialNumber });
    
    if (!device) {
      console.error(`❌ Пристрій з серійним номером ${serialNumber} не знайдено в базі даних`);
      return;
    }
    
    device.lastActivity = new Date();
    device.status = 'online';
    
    switch (messageType) {
      case 'fill_level':
        const fillLevel = parseInt(message.toString(), 10);
        
        if (!isNaN(fillLevel) && fillLevel >= 0 && fillLevel <= 100) {
          await device.updateFillLevel(fillLevel);
          console.log(`✅ Оновлено рівень заповнення для пристрою ${serialNumber}: ${fillLevel}%`);
        } else {
          console.error(`❌ Некоректне значення рівня заповнення: ${message.toString()}`);
        }
        break;
      
      case 'detecting':
        // Обробка повідомлення про виявлення об'єкта
        const isDetected = message.toString().toLowerCase() === 'true';
        
        // Можна зберігати інформацію про виявлення в базі даних або виконувати інші дії
        console.log(`📊 Пристрій ${serialNumber} ${isDetected ? 'виявив' : 'не виявив'} об'єкт в діапазоні 1м`);
        
        // Тут можна реалізувати додаткову логіку, якщо потрібно
        // Наприклад, якщо об'єкт виявлено близько до заповненого смітника,
        // можна відправити повідомлення про необхідність очищення
        
        await device.save();
        break;
        
      default:
        console.log(`Невідомий тип повідомлення: ${messageType}`);
    }
  } catch (error) {
    console.error('❌ Помилка обробки MQTT повідомлення:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('❌ Помилка MQTT з\'єднання:', error);
});

mqttClient.on('offline', () => {
  console.log('🔌 MQTT клієнт відключено від мережі');
});

mqttClient.on('reconnect', () => {
  console.log('🔄 Спроба перепідключення до MQTT брокера...');
});

// Експортуємо клієнт та функції
module.exports = {
  mqttClient
};