const testRepository = require("../../../database/mongo/repositories/tests.repository");
const modelRegistry = require("../../../database/mongo/modelRegistry");

// Helper function to sync trade-service associations
const syncTradeAssociation = async (tradeId, testId, action = 'add') => {
  try {
    if (!tradeId || !testId) return;
    
    const TradeServiceAssociation = modelRegistry.getModel('trade-service-associations');
    
    let association = await TradeServiceAssociation.findOne({ trade: tradeId });
    
    if (action === 'add') {
      if (association) {
        if (!association.tests.includes(testId)) {
          association.tests.push(testId);
          await association.save();
          console.log(`[syncTradeAssociation] Added test ${testId} to trade ${tradeId}`);
        }
      } else {
        association = new TradeServiceAssociation({
          trade: tradeId,
          cards: [],
          tests: [testId],
          courses: [],
          qualifications: []
        });
        await association.save();
        console.log(`[syncTradeAssociation] Created new association for trade ${tradeId} with test ${testId}`);
      }
    } else if (action === 'remove' && association) {
      association.tests = association.tests.filter(
        id => id.toString() !== testId.toString()
      );
      await association.save();
      console.log(`[syncTradeAssociation] Removed test ${testId} from trade ${tradeId}`);
    }
  } catch (error) {
    console.error('[syncTradeAssociation] Error:', error);
  }
};

// CREATE
module.exports.createTest = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newTestResponse = await testRepository.createTest(req.body);
    
    // Auto-sync trade association
    if (newTestResponse && newTestResponse._id && req.body.tradeId) {
      await syncTradeAssociation(req.body.tradeId, newTestResponse._id, 'add');
    }
    
    res.json(newTestResponse);
  } catch (e) {
    console.log(e);
    res.json({
      err: e.message,
    });
  }
};

// READ
module.exports.getTests = async (req, res) => {
  const filterCriteria = {};
  if (req.query.tradeId) {
    filterCriteria.tradeId = req.query.tradeId;
  }
  if (req.query.category) {
      filterCriteria.category = req.query.category;
    }
  const testsList = await testRepository.getTests(filterCriteria);
  res.json(testsList);
};

module.exports.getTestById = async (req, res) => {
  try {
    const reqObj = req.body;

    const sort = {
      createdAt: -1,
    };

    const limit = reqObj.limit || 500;

    const searchReqObj = {
      _id: req.params.testId,
    };

    const populateObj = [
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ];

    const test = await testRepository.getTestsPopulateData(
      searchReqObj,
      populateObj,
      sort,
      limit
    );

    res.json(test);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// UPDATE
module.exports.updateTest = async (req, res) => {
  try {
    // Get old test to check if trade changed
    const Test = modelRegistry.getModel('tests');
    const oldTest = await Test.findById(req.params.testId);
    
    const updateResp = await testRepository.updateTest(
      { _id: req.params.testId },
      req.body
    );
    
    // Handle trade association updates
    if (oldTest && req.body.tradeId) {
      const oldTradeId = oldTest.tradeId?.toString();
      const newTradeId = req.body.tradeId?.toString();
      
      if (oldTradeId !== newTradeId) {
        if (oldTradeId) {
          await syncTradeAssociation(oldTradeId, req.params.testId, 'remove');
        }
        if (newTradeId) {
          await syncTradeAssociation(newTradeId, req.params.testId, 'add');
        }
      } else if (newTradeId) {
        await syncTradeAssociation(newTradeId, req.params.testId, 'add');
      }
    }
    
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteTest = async (req, res) => {
  try {
    // Get test to find its trade before deleting
    const Test = modelRegistry.getModel('tests');
    const test = await Test.findById(req.params.testId);
    
    const deleteResp = await testRepository.deleteTestByTestId({
      _id: req.params.testId,
    });
    
    // Remove from trade association
    if (test && test.tradeId) {
      await syncTradeAssociation(test.tradeId, req.params.testId, 'remove');
    }
    
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
