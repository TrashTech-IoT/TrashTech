const express = require('express');
const router = express.Router();
const { createDevice, getDeviceInfo, getFillLevelHistory, getFillLevel, getUserDevices, deleteDevice,
    getAllDevices, addDeviceConnection, createDeviceWithoutOwner } = require('../controllers/dashboardController'); // Import the getDeviceInfo function
const { authMiddleware, deviceAuth } = require('../middleware/auth');

// Route to create a new device
router.post('/device', authMiddleware, createDevice);

// Route to get device information by serial number
router.get('/device/:serialNumber', authMiddleware, getDeviceInfo);

// Route to get the current fillLevel of a device
router.get('/device/:serialNumber/fillLevel', authMiddleware, getFillLevel);

// Route to get the fillLevelHistory of a device
router.get('/device/:serialNumber/fillLevelHistory', authMiddleware, getFillLevelHistory);

// Route to get all devices for the authenticated user
router.get('/devices', authMiddleware, getUserDevices);

router.delete('/device-delete', authMiddleware, deleteDevice);

router.patch('/device-add', deviceAuth, addDeviceConnection);

router.post('/device-squared', authMiddleware, createDeviceWithoutOwner);

router.get('/devices-all', authMiddleware, getAllDevices);

module.exports = router;