const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  fillLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  fillLevelHistory: [{
    level: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true 
});

DeviceSchema.index({ location: '2dsphere' });

DeviceSchema.methods.updateFillLevel = function(newLevel) {
  this.fillLevel = newLevel;
  this.fillLevelHistory.push({ 
    level: newLevel, 
    timestamp: new Date() 
  });
  return this.save();
};

module.exports = mongoose.model('Device', DeviceSchema);