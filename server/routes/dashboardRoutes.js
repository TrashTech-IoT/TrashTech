const express = require('express');
const router = express.Router();
const { createDevice, getDeviceInfo, getFillLevelHistory, getFillLevel, getUserDevices, deleteDevice,
    getAllDevices, addDeviceConnection, createDeviceWithoutOwner } = require('../controllers/dashboardController'); // Import the getDeviceInfo function
const { authMiddleware, deviceAuth } = require('../middleware/auth');

// Route to get the current fillLevel of a device
router.get('/device/:serialNumber/fillLevel', authMiddleware, getFillLevel);

// Route to get the fillLevelHistory of a device
router.get('/device/:serialNumber/fillLevelHistory', authMiddleware, getFillLevelHistory);

// Route to get all devices for the authenticated user
router.get('/devices', authMiddleware, getUserDevices);

module.exports = router;