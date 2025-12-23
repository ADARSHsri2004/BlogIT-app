const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');

const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
};

module.exports = connectDB;

