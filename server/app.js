const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/tasks', taskRoutes);

// MongoDB Connection (updated for Mongoose 6+)
mongoose.connect('mongodb://127.0.0.1:27017/tasktracker')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Verify connection by listing collections
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error verifying collections:', err);
        return;
      }
      console.log('Available collections:', collections.map(c => c.name));
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on connection failure
  });

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
});

module.exports = app;