const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecomm';

mongoose.connect(dbURI);

mongoose.connection.on('connected', () => {
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    console.log(`Mongoose connected to ${dbURI}`);
  }
});
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose connection error: ${err}`);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
