const { mqttEvents } = require('../config/mqtt');
const Device = require('../models/Device'); // Import the Device model
const jwt = require('jsonwebtoken');
// Listen for the 'messageReceived' event
mqttEvents.on('messageReceived', async (message) => {
    console.log('📩 Нове повідомлення отримано в dashboardController:', message);
  
    try {
      // Parse the topic and payload
      const { topic, payload } = message;
      console.log('Topic:', topic);
      console.log('Payload:', payload);
  
      // Check if the payload is a JSON string and parse it
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (error) {
        console.error('❌ Помилка парсингу payload:', error);
        return;
      }
  
      // Extract serial number and fill level from the payload
      const serialNumber = parsedPayload.serial_number;
      console.log(serialNumber)
      const fillLevelRaw = parsedPayload.fill_level;
      console.log(fillLevelRaw)
  
      if (!serialNumber || !fillLevelRaw) {
        console.error('❌ Відсутні необхідні дані в payload:', parsedPayload);
        return;
      }
  
  
      // Find the device by serial number
      const device = await Device.findOne({ serialNumber });
      if (!device) {
        console.error(`❌ Пристрій з серійним номером ${serialNumber} не знайдено в базі даних`);
        return;
      }
  
      // Update the device's last activity and status
      device.lastActivity = new Date();
      device.status = 'online';
  
      // Update only the fillLevelHistory
      await device.updateFillLevelHistory(fillLevelRaw);
  
      console.log(`✅ Оновлено історію рівня заповнення для пристрою ${serialNumber}: ${fillLevelRaw}`);
    } catch (error) {
      console.error('❌ Помилка обробки повідомлення в dashboardController:', error);
    }
  });

  const createDevice = async (req, res) => {
    try {
      const { serialNumber, status, fillLevel, batteryLevel } = req.body;
  
      // Validate the serial number
      if (!serialNumber) {
        return res.status(400).json({ error: 'Serial number is required' });
      }
  
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
      if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing.' });
      }
  
      // Decode the token to get the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
      const userId = decoded.id; // Assuming the token payload contains `id`
  
      // Check if the device already exists
      const existingDevice = await Device.findOne({ serialNumber });
      if (existingDevice) {
        return res.status(400).json({ error: 'Device with this serial number already exists' });
      }
  
      // Create a new device
      const newDevice = new Device({
        serialNumber,
        owner: userId, // Set the owner to the authenticated user's ID
        status: status || 'offline', // Default to 'offline' if not provided
        fillLevel: fillLevel || 0, // Default to 0 if not provided
        batteryLevel: batteryLevel || 100, // Default to 100 if not provided
      });
  
      // Save the device to the database
      await newDevice.save();
  
      res.status(201).json({ message: 'Device created successfully', device: newDevice });
    } catch (error) {
      console.error('❌ Error creating device:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Function to get device information by serial number
const getDeviceInfo = async (req, res) => {
    try {
      const { serialNumber } = req.params; // Extract serialNumber from route parameters
  
      // Validate the serial number
      if (!serialNumber) {
        return res.status(400).json({ error: 'Serial number is required' });
      }
  
      // Find the device by serial number
      const device = await Device.findOne({ serialNumber });
      if (!device) {
        return res.status(404).json({ error: `Device with serial number ${serialNumber} not found` });
      }
  
      // Return the full device information
      res.status(200).json({ device });
    } catch (error) {
      console.error('❌ Error retrieving device information:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Function to get the current fillLevel of a device
const getFillLevel = async (req, res) => {
    try {
      const { serialNumber } = req.params; // Extract serialNumber from route parameters
  
      // Validate the serial number
      if (!serialNumber) {
        return res.status(400).json({ error: 'Serial number is required' });
      }
  
      // Find the device by serial number
      const device = await Device.findOne({ serialNumber });
      if (!device) {
        return res.status(404).json({ error: `Device with serial number ${serialNumber} not found` });
      }
  
      // Return the fillLevel
      res.status(200).json({ fillLevel: device.fillLevel });
    } catch (error) {
      console.error('❌ Error retrieving fillLevel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Function to get the fillLevelHistory of a device
  const getFillLevelHistory = async (req, res) => {
    try {
      const { serialNumber } = req.params; // Extract serialNumber from route parameters
  
      // Validate the serial number
      if (!serialNumber) {
        return res.status(400).json({ error: 'Serial number is required' });
      }
  
      // Find the device by serial number
      const device = await Device.findOne({ serialNumber });
      if (!device) {
        return res.status(404).json({ error: `Device with serial number ${serialNumber} not found` });
      }
  
      // Return the fillLevelHistory
      res.status(200).json({ fillLevelHistory: device.fillLevelHistory });
    } catch (error) {
      console.error('❌ Error retrieving fillLevelHistory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  const getUserDevices = async (req, res) => {
    try {
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
      if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing.' });
      }
  
      // Decode the token to get the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
      const userId = decoded.id; // Assuming the token payload contains `id`
  
      // Find all devices owned by the user
      const devices = await Device.find({ owner: userId });
  
      // Check if the user has any devices
      if (devices.length === 0) {
        return res.status(404).json({ message: 'No devices found for this user.' });
      }
  
      // Return the devices
      res.status(200).json({ devices });
    } catch (error) {
      console.error('❌ Error retrieving user devices:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const deleteDevice = async (req, res) => {
    try {
      const { serialNumber } = req.body; // Extract serialNumber from the request body
  
      // Validate the serial number
      if (!serialNumber) {
        return res.status(400).json({ error: 'Serial number is required.' });
      }
  
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
      if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing.' });
      }
  
      // Decode the token to get the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
      const userId = decoded.id; // Assuming the token payload contains `id`
  
      // Find the device by serial number
      const device = await Device.findOne({ serialNumber });
      if (!device) {
        return res.status(404).json({ error: `Device with serial number ${serialNumber} not found.` });
      }
  
      // Check if the authenticated user is the owner of the device
      if (device.owner.toString() !== userId) {
        return res.status(403).json({ error: 'You are not authorized to delete this device.' });
      }
  
      // Delete the device
      await device.deleteOne();
  
      res.status(200).json({ message: `Device with serial number ${serialNumber} deleted successfully.` });
    } catch (error) {
      console.error('❌ Error deleting device:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };

  // Export the functions
  module.exports = {
    createDevice,
    getFillLevel,
    getFillLevelHistory,
    getDeviceInfo,
    getUserDevices,
    deleteDevice,
  };