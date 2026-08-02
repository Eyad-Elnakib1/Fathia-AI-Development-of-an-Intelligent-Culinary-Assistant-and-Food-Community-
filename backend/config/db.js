const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServer;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fridge-fusion', {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.log(`External MongoDB connection failed (${err.message}). Starting embedded MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '../data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      
      try {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dbPath,
            storageEngine: 'wiredTiger'
          }
        });
      } catch (createErr) {
        console.warn(`Failed to start persisted MongoMemoryServer (${createErr.message}), falling back to in-memory...`);
        mongoServer = await MongoMemoryServer.create();
      }
      
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Connected to Embedded MongoDB Server: ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error('All MongoDB connection attempts failed:', fallbackErr.message);
    }
  }
};

module.exports = connectDB;
