require('dotenv').config();
const mqtt = require('mqtt');
const { EventEmitter } = require('events'); // Import EventEmitter
const Device = require('../models/Device');

let global_message = ''; // Declare global_message

// Create an EventEmitter instance
const mqttEvents = new EventEmitter();

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
  global_message = message.toString(); // Update global_message

  // Emit an event with the updated global_message
  mqttEvents.emit('messageReceived', { topic, payload: message.toString() });
  try {
    // Handle the message (existing logic)
    const topicParts = topic.split('/');
    if (topicParts.length < 3) return;
    
    const serialNumber = topicParts[1];
    const messageType = topicParts[2];
    
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
        const isDetected = message.toString().toLowerCase() === 'true';
        console.log(`📊 Пристрій ${serialNumber} ${isDetected ? 'виявив' : 'не виявив'} об'єкт в діапазоні 1м`);
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

// Export mqttClient, mqttEvents, and a getter for global_message
module.exports = {
  mqttClient,
  mqttEvents, // Export the EventEmitter instance
};