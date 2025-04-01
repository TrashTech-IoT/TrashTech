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
  // location: {
  //   type: {
  //     type: String,
  //     enum: ['Point'],
  //     default: 'Point'
  //   },
  //   coordinates: {
  //     type: [Number],
  //     required: true
  //   }
  // },
  status: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  fillLevel: {
    type: String,
    required: true,
    //type: Number,
    //min: 0,
    //max: 100,
    //default: 0
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
    level: {
      type: String, // Store the fill level as a string
      required: true,
    },
    timestamp: {
      type: Date, // Store the timestamp as a date
      default: Date.now,
    },
  }],
}, { 
  timestamps: true 
});

DeviceSchema.index({ location: '2dsphere' });

DeviceSchema.methods.updateFillLevelHistory = function(newLevel) {
  // Оновлюємо поле fillLevel
  this.fillLevel = newLevel;

  // Додаємо новий запис у fillLevelHistory
  this.fillLevelHistory.push({ 
    level: String(newLevel), // Перетворюємо значення на строку
    timestamp: new Date(), // Додаємо поточну дату
  });

  // Зберігаємо зміни
  return this.save();
};

module.exports = mongoose.model('Device', DeviceSchema);