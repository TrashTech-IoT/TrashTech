const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB підключено успішно');
  } catch (error) {
    console.error('❌ Помилка підключення до MongoDB:', error.message);
    console.log("URI:", process.env.MONGODB_URI);
    process.exit(1);
  }
};

module.exports = connectDatabase;