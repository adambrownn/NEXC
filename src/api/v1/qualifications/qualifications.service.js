const qualificationRepo = require("../../../database/mongo/repositories/qualifications.repository");
const modelRegistry = require("../../../database/mongo/modelRegistry");

// Helper function to sync trade-service associations
const syncTradeAssociation = async (tradeId, qualificationId, action = 'add') => {
  try {
    if (!tradeId || !qualificationId) return;
    
    const TradeServiceAssociation = modelRegistry.getModel('trade-service-associations');
    
    // Find existing association for this trade
    let association = await TradeServiceAssociation.findOne({ trade: tradeId });
    
    if (action === 'add') {
      if (association) {
        // Add qualification if not already present
        if (!association.qualifications.includes(qualificationId)) {
          association.qualifications.push(qualificationId);
          await association.save();
          console.log(`[syncTradeAssociation] Added qualification ${qualificationId} to trade ${tradeId}`);
        }
      } else {
        // Create new association
        association = new TradeServiceAssociation({
          trade: tradeId,
          qualifications: [qualificationId],
          cards: [],
          tests: [],
          courses: []
        });
        await association.save();
        console.log(`[syncTradeAssociation] Created new association for trade ${tradeId} with qualification ${qualificationId}`);
      }
    } else if (action === 'remove' && association) {
      // Remove qualification from association
      association.qualifications = association.qualifications.filter(
        id => id.toString() !== qualificationId.toString()
      );
      await association.save();
      console.log(`[syncTradeAssociation] Removed qualification ${qualificationId} from trade ${tradeId}`);
    }
  } catch (error) {
    console.error('[syncTradeAssociation] Error:', error);
    // Don't throw - this is a background sync operation
  }
};

// CREATE
module.exports.createQualification = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newQualificationResp = await qualificationRepo.createQualification(
      req.body
    );
    
    // Auto-sync trade association
    if (newQualificationResp && newQualificationResp._id && req.body.tradeId) {
      await syncTradeAssociation(req.body.tradeId, newQualificationResp._id, 'add');
    }
    
    res.json(newQualificationResp);
  } catch (e) {
    console.log(e);
    res.json({
      err: e.message,
    });
  }
};

// READ with Pagination and Filtering
module.exports.getQualifications = async (req, res) => {
  try {
    const filterCriteria = {};
    
    // Filter by trade
    if (req.query.tradeId) {
      filterCriteria.tradeId = req.query.tradeId;
    }
    
    // Filter by level
    if (req.query.level) {
      filterCriteria.level = parseInt(req.query.level);
    }
    
    // Filter by category
    if (req.query.category) {
      filterCriteria.category = req.query.category;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filterCriteria.price = {};
      if (req.query.minPrice) filterCriteria.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filterCriteria.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Search by title
    if (req.query.search) {
      filterCriteria.title = { $regex: req.query.search, $options: 'i' };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };
    
    // Get total count for pagination
    const Qualification = require('../../../database/mongo/modelRegistry').getModel('qualifications');
    const total = await Qualification.countDocuments(filterCriteria);
    
    // Get qualifications with pagination
    const qualifications = await Qualification.find(filterCriteria)
      .populate({
        path: 'tradeId',
        select: 'title isAvailable description'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: qualifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: skip + qualifications.length < total
      }
    });
  } catch (e) {
    console.error('Error fetching qualifications:', e);
    res.status(500).json({ success: false, error: e.message });
  }
};

// Get Qualifications Statistics
module.exports.getQualificationsStats = async (req, res) => {
  try {
    const Qualification = require('../../../database/mongo/modelRegistry').getModel('qualifications');
    
    const stats = await Qualification.aggregate([
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byLevel: [
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          byPrice: [
            { $group: { _id: '$price', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          priceRange: [
            {
              $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgPrice: { $avg: '$price' }
              }
            }
          ]
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total: stats[0].totalCount[0]?.count || 0,
        byLevel: stats[0].byLevel,
        byCategory: stats[0].byCategory,
        byPrice: stats[0].byPrice,
        priceRange: stats[0].priceRange[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 }
      }
    });
  } catch (e) {
    console.error('Error fetching qualification stats:', e);
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports.getQualificationById = async (req, res) => {
  try {
    const reqObj = req.body;

    const sort = {
      createdAt: -1,
    };

    const limit = reqObj.limit || 500;

    const searchReqObj = {
      _id: req.params.qualificationId,
    };

    const populateObj = [
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ];

    const qualification = await qualificationRepo.getQualificationsPopulateData(
      searchReqObj,
      populateObj,
      sort,
      limit
    );

    res.json(qualification);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// UPDATE
module.exports.updateQualification = async (req, res) => {
  try {
    // Get old qualification to check if trade changed
    const Qualification = modelRegistry.getModel('qualifications');
    const oldQual = await Qualification.findById(req.params.qualificationId);
    
    const updateResp = await qualificationRepo.updateQualification(
      { _id: req.params.qualificationId },
      req.body
    );
    
    // Handle trade association updates
    if (oldQual && req.body.tradeId) {
      const oldTradeId = oldQual.tradeId?.toString();
      const newTradeId = req.body.tradeId?.toString();
      
      // If trade changed, update associations
      if (oldTradeId !== newTradeId) {
        // Remove from old trade association
        if (oldTradeId) {
          await syncTradeAssociation(oldTradeId, req.params.qualificationId, 'remove');
        }
        // Add to new trade association
        if (newTradeId) {
          await syncTradeAssociation(newTradeId, req.params.qualificationId, 'add');
        }
      } else if (newTradeId) {
        // Same trade, ensure it's in association
        await syncTradeAssociation(newTradeId, req.params.qualificationId, 'add');
      }
    }
    
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteQualification = async (req, res) => {
  try {
    // Get qualification to find its trade before deleting
    const Qualification = modelRegistry.getModel('qualifications');
    const qual = await Qualification.findById(req.params.qualificationId);
    
    const deleteResp =
      await qualificationRepo.deleteQualificationByQualificationId({
        _id: req.params.qualificationId,
      });
    
    // Remove from trade association
    if (qual && qual.tradeId) {
      await syncTradeAssociation(qual.tradeId, req.params.qualificationId, 'remove');
    }
    
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
