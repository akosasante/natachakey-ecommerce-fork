const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const connectDB = (url) => {
  console.log('connecting to db');
  return mongoose.connect(url, { connectTimeoutMS: 5000 });
};

module.exports = connectDB;
