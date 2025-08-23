const express = require('express');
const router = express.Router();
const tradeServiceAssociationsService = require('./tradeServiceAssociations.service');

// Get all associations
router.get('/', async (req, res) => {
  console.log('GET /trade-service-associations - Request received');
  try {
    console.log('Attempting to fetch associations from service...');
    const associations = await tradeServiceAssociationsService.getAssociations();
    console.log(`Successfully fetched ${associations?.length || 0} associations`);
    res.status(200).json(associations);
  } catch (error) {
    console.error('Error in GET /trade-service-associations:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Check for specific error types
    if (error.name === 'MongooseError') {
      console.error('Database error:', error);
      res.status(500).json({ 
        message: 'Database error occurred', 
        error: error.message,
        type: error.name
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        type: error.name
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message,
        type: error.name
      });
    }
  }
});

// Get association by ID
router.get('/:id', async (req, res) => {
  console.log(`GET /trade-service-associations/${req.params.id} - Request received`);
  try {
    console.log(`Attempting to fetch association with ID ${req.params.id} from service...`);
    const association = await tradeServiceAssociationsService.getAssociationById(req.params.id);
    if (association) {
      console.log(`Successfully fetched association with ID ${req.params.id}`);
      res.status(200).json(association);
    } else {
      console.log(`Association with ID ${req.params.id} not found`);
      res.status(404).json({ message: 'Association not found' });
    }
  } catch (error) {
    console.error(`Error in GET /trade-service-associations/${req.params.id}:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Check for specific error types
    if (error.name === 'MongooseError') {
      console.error('Database error:', error);
      res.status(500).json({ 
        message: 'Database error occurred', 
        error: error.message,
        type: error.name
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        type: error.name
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message,
        type: error.name
      });
    }
  }
});

// Create new association
router.post('/', async (req, res) => {
  console.log('POST /trade-service-associations - Request received');
  try {
    console.log('Attempting to create new association in service...');
    const newAssociation = await tradeServiceAssociationsService.createAssociation(req.body);
    console.log(`Successfully created new association with ID ${newAssociation.id}`);
    res.status(201).json(newAssociation);
  } catch (error) {
    console.error('Error in POST /trade-service-associations:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Check for specific error types
    if (error.name === 'MongooseError') {
      console.error('Database error:', error);
      res.status(500).json({ 
        message: 'Database error occurred', 
        error: error.message,
        type: error.name
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        type: error.name
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message,
        type: error.name
      });
    }
  }
});

// Update association
router.put('/:id', async (req, res) => {
  console.log(`PUT /trade-service-associations/${req.params.id} - Request received`);
  try {
    console.log(`Attempting to update association with ID ${req.params.id} in service...`);
    const updatedAssociation = await tradeServiceAssociationsService.updateAssociation(req.params.id, req.body);
    if (updatedAssociation) {
      console.log(`Successfully updated association with ID ${req.params.id}`);
      res.status(200).json(updatedAssociation);
    } else {
      console.log(`Association with ID ${req.params.id} not found`);
      res.status(404).json({ message: 'Association not found' });
    }
  } catch (error) {
    console.error(`Error in PUT /trade-service-associations/${req.params.id}:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Check for specific error types
    if (error.name === 'MongooseError') {
      console.error('Database error:', error);
      res.status(500).json({ 
        message: 'Database error occurred', 
        error: error.message,
        type: error.name
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        type: error.name
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message,
        type: error.name
      });
    }
  }
});

// Delete association
router.delete('/:id', async (req, res) => {
  console.log(`DELETE /trade-service-associations/${req.params.id} - Request received`);
  try {
    console.log(`Attempting to delete association with ID ${req.params.id} from service...`);
    const deletedAssociation = await tradeServiceAssociationsService.deleteAssociation(req.params.id);
    if (deletedAssociation) {
      console.log(`Successfully deleted association with ID ${req.params.id}`);
      res.status(200).json({ message: 'Association deleted successfully' });
    } else {
      console.log(`Association with ID ${req.params.id} not found`);
      res.status(404).json({ message: 'Association not found' });
    }
  } catch (error) {
    console.error(`Error in DELETE /trade-service-associations/${req.params.id}:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Check for specific error types
    if (error.name === 'MongooseError') {
      console.error('Database error:', error);
      res.status(500).json({ 
        message: 'Database error occurred', 
        error: error.message,
        type: error.name
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        type: error.name
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message,
        type: error.name
      });
    }
  }
});

module.exports = router;