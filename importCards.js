require('dotenv').config({ path: './env/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Card = require('./src/database/mongo/schemas/Cards.schema');

mongoose.connect(process.env.MONGO_CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const importCards = async () => {
  try {
    // Delete existing cards
    await Card.deleteMany({});
    console.log('Existing cards deleted');

    // Read the JSON file
    const cardData = JSON.parse(fs.readFileSync('./data/cardData.json', 'utf-8'));

    // Transform and insert the data
    const transformedData = cardData.map(card => ({
      title: card.Title,
      description: card.Description,
      price: card.Price,
      category: card.Category,
      color: card.Color,
      validity: card.Validity
    }));

    await Card.insertMany(transformedData);
    console.log('Cards imported successfully');
  } catch (error) {
    console.error('Error importing cards:', error);
  } finally {
    mongoose.disconnect();
  }
};

importCards();