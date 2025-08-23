const tradeRepo = require("../../../database/mongo/repositories/trades.repository");
const TradeServiceAssociation = require('../../../database/mongo/schemas/TradeServiceAssociation.schema');
const modelRegistry = require("../../../database/mongo/modelRegistry");
const mongoose = require('mongoose');
const Qualification = require('../../../database/mongo/schemas/Qualification.schema');

// CREATE
module.exports.createTrade = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newTradeResp = await tradeRepo.createTrade(req.body);
    res.json({ success: true, data: newTradeResp });
  } catch (e) {
    console.log(e);
    res.json({ success: false, error: e.message });
  }
};

// READ
module.exports.getTrades = async (req, res) => {
  try {
    console.log('[getTrades] Fetching all trades');
    const TradesList = await tradeRepo.getTrades({});
    console.log(`[getTrades] Found ${TradesList?.length || 0} trades`);
    
    if (!Array.isArray(TradesList)) {
      console.error('[getTrades] Invalid trades list format:', TradesList);
      throw new Error('Invalid trades list format');
    }
    
    res.json({
      success: true,
      data: TradesList.map(trade => ({
        _id: trade._id,
        title: trade.title || trade.name,
        ...trade
      }))
    });
  } catch (error) {
    console.error('[getTrades] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trades'
    });
  }
};

module.exports.getTradeById = async (req, res) => {
  try {
    const TradesList = await tradeRepo.getTrades({
      _id: req.params.tradeId,
    });
    if (!TradesList || TradesList.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Trade not found'
      });
    }
    res.json({ success: true, data: TradesList });
  } catch (error) {
    console.error('Error in getTradeById:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trade'
    });
  }
};

module.exports.getServicesByTradeId = async (req, res) => {
  try {
    console.log('[getServicesByTradeId] Request params:', req.params);
    
    // Get all services first
    const allServices = await tradeRepo.getAllServices({});
    console.log('[getServicesByTradeId] Services fetched:', {
      cards: allServices.cards?.length || 0,
      courses: allServices.courses?.length || 0,
      tests: allServices.tests?.length || 0
    });
    
    if (!req.params.tradeId) {
      // If no trade selected, return all services
      console.log('[getServicesByTradeId] No trade ID, returning all services');
      return res.json({ success: true, data: allServices });
    }

    // Get associations for this trade
    console.log('[getServicesByTradeId] Fetching associations for trade:', req.params.tradeId);
    
    // Get the TradeServiceAssociation model
    const TradeServiceAssociationModel = modelRegistry.getModel("trade-service-associations");
    if (!TradeServiceAssociationModel) {
      throw new Error('TradeServiceAssociation model not found in registry');
    }
    
    // Find association with proper ObjectId conversion
    const tradeId = mongoose.Types.ObjectId.isValid(req.params.tradeId) 
      ? new mongoose.Types.ObjectId(req.params.tradeId)
      : null;
      
    if (!tradeId) {
      throw new Error('Invalid trade ID format');
    }

    // Debug: Check if collection exists and count documents
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('[getServicesByTradeId] Available collections:', collections.map(c => c.name));
    
    const collectionName = TradeServiceAssociationModel.collection.name;
    console.log('[getServicesByTradeId] Looking in collection:', collectionName);
    
    // Count total documents in collection
    const totalDocs = await TradeServiceAssociationModel.countDocuments();
    console.log('[getServicesByTradeId] Total documents in collection:', totalDocs);
    
    // Debug: Log the query we're about to make
    console.log('[getServicesByTradeId] Looking for association with query:', { trade: tradeId });
    
    const association = await TradeServiceAssociationModel.findOne({ trade: tradeId })
      .populate('cards')
      .populate('courses')
      .populate('tests');
    
    console.log('[getServicesByTradeId] Association found:', association ? 'Yes' : 'No');
    if (association) {
      console.log('[getServicesByTradeId] Association details:', {
        id: association._id,
        trade: association.trade,
        cardsCount: association.cards?.length || 0,
        coursesCount: association.courses?.length || 0,
        testsCount: association.tests?.length || 0
      });
    }

    console.log('[getServicesByTradeId] Association details:', {
      found: !!association,
      cards: association?.cards?.length || 0,
      courses: association?.courses?.length || 0,
      tests: association?.tests?.length || 0,
      tradeId: tradeId.toString()
    });

    if (!association) {
      // If no associations found, return all services but mark them as not associated
      console.log('[getServicesByTradeId] No associations found for trade:', req.params.tradeId);
      return res.json({
        success: true,
        data: {
          ...allServices,
          associatedServiceIds: []
        }
      });
    }

    // Extract IDs from all associated services
    const associatedServiceIds = [
      ...(association.cards?.map(card => card._id.toString()) || []),
      ...(association.courses?.map(course => course._id.toString()) || []),
      ...(association.tests?.map(test => test._id.toString()) || [])
    ];

    console.log('[getServicesByTradeId] Found associations:', {
      tradeId: req.params.tradeId,
      cardsCount: association.cards?.length || 0,
      coursesCount: association.courses?.length || 0,
      testsCount: association.tests?.length || 0,
      totalAssociatedServices: associatedServiceIds.length,
      associatedServiceIds
    });

    // Return services with association information
    return res.json({
      success: true,
      data: {
        ...allServices,
        associatedServiceIds
      }
    });
  } catch (error) {
    console.error('[getServicesByTradeId] Detailed error:', error);
    console.error('[getServicesByTradeId] Stack trace:', error.stack);
    console.error('[getServicesByTradeId] Error type:', error.constructor.name);
    if (error instanceof mongoose.Error) {
      console.error('[getServicesByTradeId] Mongoose error details:', error.message);
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch services',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get qualifications
module.exports.getQualifications = async (req, res) => {
  try {
    const qualifications = await Qualification.find({});
    res.json({ success: true, data: qualifications });
  } catch (error) {
    console.error('Error in getQualifications:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch qualifications'
    });
  }
};

// UPDATE
module.exports.updateTrade = async (req, res) => {
  try {
    const updateResp = await tradeRepo.updateTrade(
      { _id: req.params.tradeId },
      req.body
    );
    res.json({ success: true, data: updateResp });
  } catch (e) {
    console.log(e);
    res.json({ success: false, error: e.message });
  }
};

// DELETE
module.exports.deleteTrade = async (req, res) => {
  try {
    const deleteResp = await tradeRepo.deleteTradeByTradeId({
      _id: req.params.tradeId,
    });
    res.json({ success: true, data: deleteResp });
  } catch (e) {
    console.log(e);
    res.json({ success: false, error: e.message });
  }
};
