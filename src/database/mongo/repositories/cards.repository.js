const modelRegistry = require("../modelRegistry");

const getCardModel = () => {
  return modelRegistry.getModel("cards");
};

const createCard = async (cardObj) => {
  const Card = getCardModel();
  const newCard = new Card(cardObj);
  return await newCard.save();
};

const updateCard = async (criteria, dataToUpdate, options = {}) => {
  const Card = getCardModel();
  options["new"] = true;
  options["lean"] = true;
  return Card.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkCards = async (criteria, dataToUpdate) => {
  const Card = getCardModel();
  return Card.updateMany(criteria, dataToUpdate);
};

const deleteCardByCardId = async (cardId) => {
  const Card = getCardModel();
  return Card.deleteOne({ _id: cardId });
};

const getCards = async (searchObj) => {
  const Card = getCardModel();
  console.log('getCards called with searchObj:', JSON.stringify(searchObj));
  try {
    const result = await Card.find(searchObj).populate([
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ]);
    console.log('getCards result:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error in getCards:', error);
    throw error;
  }
};

const getCardsPopulateData = async (searchObj, populateObj, sort, limit) => {
  const Card = getCardModel();
  return Card.find(searchObj)
    .populate(populateObj)
    .sort(sort)
    .limit(limit)
    .collation({
      locale: "en",
      strength: 2,
    });
};

const getCardsAggregateData = (criteria) => {
  const Card = getCardModel();
  return Card.aggregate(criteria);
};

const getCardsByTradeId = async (tradeId) => {
  const Card = getCardModel();
  // Convert to array if it's not already
  const tradeIdArray = Array.isArray(tradeId) ? tradeId : [tradeId];
  return Card.find({ tradeId: { $in: tradeIdArray } }).populate([
    {
      path: "tradeId",
      select: "title isAvailable",
    },
  ]);
};

module.exports = {
  createCard,
  updateCard,
  updateBulkCards,
  deleteCardByCardId,
  getCards,
  getCardsPopulateData,
  getCardsAggregateData,
  getCardsByTradeId,
};
