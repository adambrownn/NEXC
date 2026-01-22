const cardRepository = require("../../../database/mongo/repositories/cards.repository");
const modelRegistry = require("../../../database/mongo/modelRegistry");

// Helper function to sync trade-service associations for a SINGLE trade
const syncTradeAssociation = async (tradeId, cardId, action = 'add') => {
  try {
    if (!tradeId || !cardId) return;
    
    const TradeServiceAssociation = modelRegistry.getModel('trade-service-associations');
    
    let association = await TradeServiceAssociation.findOne({ trade: tradeId });
    
    if (action === 'add') {
      if (association) {
        if (!association.cards.includes(cardId)) {
          association.cards.push(cardId);
          await association.save();
          console.log(`[syncTradeAssociation] Added card ${cardId} to trade ${tradeId}`);
        }
      } else {
        association = new TradeServiceAssociation({
          trade: tradeId,
          cards: [cardId],
          tests: [],
          courses: [],
          qualifications: []
        });
        await association.save();
        console.log(`[syncTradeAssociation] Created new association for trade ${tradeId} with card ${cardId}`);
      }
    } else if (action === 'remove' && association) {
      association.cards = association.cards.filter(
        id => id.toString() !== cardId.toString()
      );
      await association.save();
      console.log(`[syncTradeAssociation] Removed card ${cardId} from trade ${tradeId}`);
    }
  } catch (error) {
    console.error('[syncTradeAssociation] Error:', error);
  }
};

// Helper function to sync MULTIPLE trades for cards (since cards support multiple trades)
const syncMultipleTradeAssociations = async (tradeIds, cardId, action = 'add') => {
  try {
    if (!cardId) return;
    
    // Handle both array and single tradeId
    let tradeArray = [];
    if (Array.isArray(tradeIds)) {
      tradeArray = tradeIds;
    } else if (tradeIds) {
      tradeArray = [tradeIds];
    }
    
    console.log(`[syncMultipleTradeAssociations] Syncing ${tradeArray.length} trades for card ${cardId}, action: ${action}`);
    
    // Sync each trade
    for (const tradeId of tradeArray) {
      await syncTradeAssociation(tradeId, cardId, action);
    }
  } catch (error) {
    console.error('[syncMultipleTradeAssociations] Error:', error);
  }
};

// CREATE
module.exports.createCard = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const createCardResp = await cardRepository.createCard(req.body);
    
    // Auto-sync trade associations (multiple trades supported)
    if (createCardResp && createCardResp._id && req.body.tradeId) {
      await syncMultipleTradeAssociations(req.body.tradeId, createCardResp._id, 'add');
    }
    
    res.json(createCardResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};


// READ
module.exports.getCards = async (req, res) => {
  try {
    const filterCriteria = {};

    // Enable search by title or tagline
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filterCriteria["$or"] = [
        { title: { $regex: searchRegex } },
        { tagline: { $regex: searchRegex } }
      ];
    }

    // Existing filters
    if (req.query.tradeId) {
      filterCriteria.tradeId = req.query.tradeId;
    }

    if (req.query.category) {
      filterCriteria.category = req.query.category;
    }

    console.log('Calling cardRepository.getCards with filterCriteria:', JSON.stringify(filterCriteria));
    const cardsList = await cardRepository.getCards(filterCriteria);
    console.log('cardsList received:', JSON.stringify(cardsList));
    res.json(cardsList);
  } catch (e) {
    console.error(e);
    console.error('Error in getCards service:', e);
    res.status(500).json({ err: e.message });
  }
};

module.exports.getCardById = async (req, res) => {
  try {
    const reqObj = req.body;

    const sort = {
      createdAt: -1,
    };

     const limit = reqObj.limit || 500;

    const searchReqObj = {
      _id: req.params.cardId,
    };

    const populateObj = [
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ];

    const card = await cardRepository.getCardsPopulateData(
      searchReqObj,
      populateObj,
      sort,
      limit
    );

    res.json(card);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// UPDATE
module.exports.updateCard = async (req, res) => {
  try {
    // Get old card to check if trades changed
    const Card = modelRegistry.getModel('cards');
    const oldCard = await Card.findById(req.params.cardId);
    
    const updateResp = await cardRepository.updateCard(
      { _id: req.params.cardId },
      req.body
    );
    
    // Handle trade association updates (multiple trades)
    if (oldCard && req.body.tradeId) {
      // Convert to arrays for comparison
      const oldTradeIds = Array.isArray(oldCard.tradeId) 
        ? oldCard.tradeId.map(id => id.toString()) 
        : (oldCard.tradeId ? [oldCard.tradeId.toString()] : []);
      
      const newTradeIds = Array.isArray(req.body.tradeId)
        ? req.body.tradeId.map(id => id.toString())
        : (req.body.tradeId ? [req.body.tradeId.toString()] : []);
      
      // Find trades to remove (in old but not in new)
      const tradesToRemove = oldTradeIds.filter(id => !newTradeIds.includes(id));
      
      // Find trades to add (in new but not in old)
      const tradesToAdd = newTradeIds.filter(id => !oldTradeIds.includes(id));
      
      console.log(`[updateCard] Card ${req.params.cardId} - Removing from ${tradesToRemove.length} trades, Adding to ${tradesToAdd.length} trades`);
      
      // Remove card from old trades
      for (const tradeId of tradesToRemove) {
        await syncTradeAssociation(tradeId, req.params.cardId, 'remove');
      }
      
      // Add card to new trades
      for (const tradeId of tradesToAdd) {
        await syncTradeAssociation(tradeId, req.params.cardId, 'add');
      }
    } else if (req.body.tradeId) {
      // No old trades, just add to new ones
      await syncMultipleTradeAssociations(req.body.tradeId, req.params.cardId, 'add');
    }
    
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteCard = async (req, res) => {
  try {
    // Get card to find its trades before deleting
    const Card = modelRegistry.getModel('cards');
    const card = await Card.findById(req.params.cardId);
    
    const deleteResp = await cardRepository.deleteCardByCardId({
      _id: req.params.cardId,
    });
    
    // Remove from all trade associations (multiple trades supported)
    if (card && card.tradeId) {
      await syncMultipleTradeAssociations(card.tradeId, req.params.cardId, 'remove');
    }
    
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
