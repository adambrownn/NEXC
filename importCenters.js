require('dotenv').config({ path: '/home/ashutosh/NEXC/env/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Center = require('./src/database/mongo/schemas/Centers.schema');

// Read the JSON data from centerData.json
const jsonData = fs.readFileSync('./data/centerData.json', 'utf8');
const centers = JSON.parse(jsonData);

// MongoDB connection string from environment variables
const mongoURI = process.env.MONGO_CONNECTION_URL;

if (!mongoURI) {
  console.error('MONGO_CONNECTION_URL is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

const importCenters = async () => {
  try {
    // Remove all existing centers
    await Center.deleteMany({});
    console.log('Existing centers removed');

    // Insert new centers
    const result = await Center.insertMany(centers);
    console.log(`${result.length} centers imported successfully`);
  } catch (error) {
    console.error('Error importing centers:', error);
  } finally {
    mongoose.disconnect();
  }
};

importCenters();