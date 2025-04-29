const { mqttEvents } = require('../config/mqtt');
const Device = require('../models/Device'); // Import the Device model
const jwt = require('jsonwebtoken');

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
          return res.status(403).json({ error: 'You are not authorized to remove this device connection.' });
        }
    
        // Remove the connection by clearing the owner field
        device.owner = null;
        await device.save();
    
        res.status(200).json({ message: `Connection to device with serial number ${serialNumber} removed successfully.` });
      } catch (error) {
        console.error('❌ Error removing device connection:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
    };

    const addDeviceConnection = async (req, res) => {
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
      
          // Check if the device is already connected to a user
          if (device.owner) {
            return res.status(400).json({ error: 'Device is already connected to another user.' });
          }
      
          // Add the connection by setting the owner field
          device.owner = userId;
          await device.save();
      
          res.status(200).json({ message: `Device with serial number ${serialNumber} connected successfully.` });
        } catch (error) {
          console.error('❌ Error adding device connection:', error);
          res.status(500).json({ error: 'Internal server error.' });
        }
      };
    
      const createDeviceWithoutOwner = async (req, res) => {
        try {
          const { serialNumber } = req.body; // Extract serialNumber from the request body
      
          // Validate the serial number
          if (!serialNumber) {
            return res.status(400).json({ error: 'Serial number is required.' });
          }
      
          // Check if the device already exists
          const existingDevice = await Device.findOne({ serialNumber });
          if (existingDevice) {
            return res.status(400).json({ error: 'Device with this serial number already exists.' });
          }
      
          // Create a new device without an owner
          const newDevice = new Device({
            serialNumber,
            owner: null, // No owner assigned
            status: 'online', // Always set to 'online'
            fillLevel: 0, // Always set to 0
            batteryLevel: null, // Always set to 0
          });
      
          // Save the device to the database
          await newDevice.save();
      
          res.status(201).json({ message: 'Device created successfully without an owner.', device: newDevice });
        } catch (error) {
          console.error('❌ Error creating device without owner:', error);
          res.status(500).json({ error: 'Internal server error.' });
        }
      };
    
      const getAllDevices = async (req, res) => {
        try {
          // Retrieve all devices from the database
          const devices = await Device.find();
      
          // Check if there are any devices
          if (devices.length === 0) {
            return res.status(404).json({ message: 'No devices found.' });
          }
      
          // Return the list of devices
          res.status(200).json({ devices });
        } catch (error) {
          console.error('❌ Error retrieving all devices:', error);
          res.status(500).json({ error: 'Internal server error.' });
        }
      };
  
module.exports = {
    createDevice,
    getDeviceInfo,
    deleteDevice,
    addDeviceConnection,
    createDeviceWithoutOwner,
    getAllDevices,
}
