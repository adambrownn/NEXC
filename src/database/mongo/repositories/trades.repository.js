const modelRegistry = require("../modelRegistry");

const getModel = (modelName) => {
  return modelRegistry.getModel(modelName);
};

const createTrade = async (tradeObj) => {
  const Trade = getModel("trades");
  const newTrade = new Trade(tradeObj);
  return await newTrade.save();
};

const updateTrade = async (criteria, dataToUpdate, options = {}) => {
  const Trade = getModel("trades");
  options["new"] = true;
  options["lean"] = true;
  return Trade.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkTrades = async (criteria, dataToUpdate) => {
  const Trade = getModel("trades");
  return Trade.updateMany(criteria, dataToUpdate);
};

const deleteTradeByTradeId = async (tradeId) => {
  const Trade = getModel("trades");
  return Trade.deleteOne({ _id: tradeId });
};

const getTrades = async (searchObj) => {
  const Trade = getModel("trades");
  console.log('[getTrades] Fetching trades with criteria:', searchObj);
  const trades = await Trade.find(searchObj).lean();
  console.log(`[getTrades] Found ${trades.length} trades`);
  return trades;
};

const getAllServices = async (searchObj) => {
  try {
    // Verify model registry is initialized
    if (!modelRegistry.areModelsInitialized()) {
      throw new Error('Model registry is not initialized');
    }

    // Try to get models first to catch any model registration issues
    const cardModel = modelRegistry.getModel("cards");
    const courseModel = modelRegistry.getModel("courses");
    const testModel = modelRegistry.getModel("tests");

    console.log('[getAllServices] Models retrieved successfully');
    console.log('[getAllServices] Fetching services with searchObj:', searchObj);

    // Get all services in parallel for better performance
    const [cards, courses, tests] = await Promise.all([
      cardModel.find(searchObj || {}).lean().exec(),
      courseModel.find(searchObj || {}).lean().exec(),
      testModel.find(searchObj || {}).lean().exec()
    ]);

    console.log('[getAllServices] Services fetched successfully:', {
      cardsCount: cards?.length || 0,
      coursesCount: courses?.length || 0,
      testsCount: tests?.length || 0
    });

    // Return categorized services
    return {
      cards: cards || [],
      courses: courses || [],
      tests: tests || []
    };
  } catch (error) {
    console.error('[getAllServices] Error:', error);
    console.error('[getAllServices] Stack:', error.stack);
    throw error;
  }
};

module.exports = {
  createTrade,
  updateTrade,
  updateBulkTrades,
  deleteTradeByTradeId,
  getTrades,
  getAllServices
};
