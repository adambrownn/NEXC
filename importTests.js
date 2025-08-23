const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env/.env') });

// Import the Test model
const Test = require('./src/database/mongo/schemas/Tests.schema');

// MongoDB connection string
const MONGODB_URI = process.env.MONGO_CONNECTION_URL;

if (!MONGODB_URI) {
  console.error('MONGO_CONNECTION_URL is not set in the environment variables');
  process.exit(1);
}

// Read the sample test data
const sampleTestData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/testData.json'), 'utf-8'));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Function to import tests
async function importTests() {
  try {
    // Delete existing tests
    await Test.deleteMany({});
    console.log('Existing tests deleted');

    // Process and insert new tests
    const processedTests = sampleTestData.map(test => ({
      title: test.Title,
      description: test.Description,
      price: test.Price,
      category: test.Category,
      validity: test.Validity,
      duration: test.Duration,
      tradeId: new mongoose.Types.ObjectId(), // Use 'new' keyword here
      isAvailable: true,
      numberOfQuestions: Math.floor(Math.random() * 50) + 20, // Random number between 20 and 70
    }));

    const insertedTests = await Test.insertMany(processedTests);
    console.log(`${insertedTests.length} tests inserted successfully`);

    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error importing tests:', error);
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to error');
  }
}

// Run the import function
importTests();