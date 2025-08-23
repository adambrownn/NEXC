const TradeServiceAssociation = require('../../../database/mongo/schemas/TradeServiceAssociation.schema');
const mongoose = require('mongoose');

exports.getAssociations = async () => {
  try {
    console.log('Attempting to fetch trade-service associations...');
    
    // First check if we're connected to MongoDB
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection is not ready. Current state: ' + mongoose.connection.readyState);
    }

    // Get all associations with populated fields
    const associations = await TradeServiceAssociation.find()
      .populate('trade', 'title name _id') // Only get necessary trade fields
      .populate('cards', 'title _id')
      .populate('tests', 'title _id')
      .populate('courses', 'title _id')
      .populate('qualifications', 'title _id')
      .lean();

    console.log('Fetched associations:', JSON.stringify(associations, null, 2));
    return associations;
  } catch (error) {
    console.error('Detailed error in getAssociations:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      mongooseReadyState: mongoose.connection.readyState,
      isMongoError: error instanceof mongoose.Error
    });
    throw error;
  }
};

exports.getAssociationById = async (id) => {
  try {
    console.log(`Attempting to fetch trade-service association with id ${id}...`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid association ID format');
    }

    const association = await TradeServiceAssociation.findById(id)
      .populate('trade', 'title name _id')
      .populate('cards', 'title _id')
      .populate('tests', 'title _id')
      .populate('courses', 'title _id')
      .populate('qualifications', 'title _id')
      .lean();

    if (!association) {
      throw new Error('Association not found');
    }

    return association;
  } catch (error) {
    console.error('Error in getAssociationById:', error);
    throw error;
  }
};

exports.createAssociation = async (data) => {
  try {
    console.log('Creating new trade-service association with data:', data);

    // Validate trade ID
    if (!mongoose.Types.ObjectId.isValid(data.trade)) {
      throw new Error('Invalid trade ID format');
    }

    // Create new association
    const association = new TradeServiceAssociation({
      trade: data.trade,
      cards: data.cards || [],
      tests: data.tests || [],
      courses: data.courses || [],
      qualifications: data.qualifications || []
    });

    // Save and populate the association
    await association.save();
    const populatedAssociation = await TradeServiceAssociation.findById(association._id)
      .populate('trade', 'title name _id')
      .populate('cards', 'title _id')
      .populate('tests', 'title _id')
      .populate('courses', 'title _id')
      .populate('qualifications', 'title _id')
      .lean();

    console.log('Successfully created association:', populatedAssociation);
    return populatedAssociation;
  } catch (error) {
    console.error('Error in createAssociation:', error);
    throw error;
  }
};

exports.updateAssociation = async (id, data) => {
  try {
    console.log(`Updating trade-service association ${id} with data:`, data);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid association ID format');
    }

    // Update the association
    const updatedAssociation = await TradeServiceAssociation.findByIdAndUpdate(
      id,
      {
        $set: {
          trade: data.trade,
          cards: data.cards || [],
          tests: data.tests || [],
          courses: data.courses || [],
          qualifications: data.qualifications || [],
          updatedAt: Date.now()
        }
      },
      { new: true }
    )
    .populate('trade', 'title name _id')
    .populate('cards', 'title _id')
    .populate('tests', 'title _id')
    .populate('courses', 'title _id')
    .populate('qualifications', 'title _id')
    .lean();

    if (!updatedAssociation) {
      throw new Error('Association not found');
    }

    return updatedAssociation;
  } catch (error) {
    console.error('Error in updateAssociation:', error);
    throw error;
  }
};

exports.deleteAssociation = async (id) => {
  try {
    console.log(`Attempting to delete trade-service association with id ${id}...`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid association ID format');
    }

    const deletedAssociation = await TradeServiceAssociation.findByIdAndDelete(id)
      .populate('trade', 'title name _id')
      .populate('cards', 'title _id')
      .populate('tests', 'title _id')
      .populate('courses', 'title _id')
      .populate('qualifications', 'title _id')
      .lean();

    if (!deletedAssociation) {
      throw new Error('Association not found');
    }

    console.log('Association deleted successfully:', deletedAssociation);
    return deletedAssociation;
  } catch (error) {
    console.error('Error in deleteAssociation:', error);
    throw error;
  }
};