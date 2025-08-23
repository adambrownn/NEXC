const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env/.env') });

// Import the Course model
const Course = require('./src/database/mongo/schemas/Courses.schema');

// MongoDB connection string
const MONGODB_URI = process.env.MONGO_CONNECTION_URL;

if (!MONGODB_URI) {
  console.error('MONGO_CONNECTION_URL is not set in the environment variables');
  process.exit(1);
}

// Read the sample course data
const sampleCourseData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/courseData.json'), 'utf-8'));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Function to import courses
async function importCourses() {
  try {
    // Delete existing courses
    await Course.deleteMany({});
    console.log('Existing courses deleted');

    // Process and insert new courses
    const processedCourses = sampleCourseData.map(course => ({
      title: course.Title,
      description: course.Description,
      price: course.Price,
      category: course.Category,
      validity: course.Validity,
      duration: course.Duration,
      tradeId: new mongoose.Types.ObjectId(), // Generate a random ObjectId for tradeId
      isAvailable: true,
      numberOfLessons: Math.floor(Math.random() * 20) + 5, // Random number between 5 and 25
    }));

    const insertedCourses = await Course.insertMany(processedCourses);
    console.log(`${insertedCourses.length} courses inserted successfully`);

    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error importing courses:', error);
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to error');
  }
}

// Run the import function
importCourses();