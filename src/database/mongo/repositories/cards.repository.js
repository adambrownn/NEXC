const Card = require("../schemas/Cards.schema");

const createCard = async (cardObj) => {
  const newCard = new Card(cardObj);
  return await newCard.save();
};

const updateCard = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Card.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkCards = async (criteria, dataToUpdate) => {
  return Card.updateMany(criteria, dataToUpdate);
};

const deleteCardByCardId = async (cardId) => {
  return Card.deleteOne({ _id: cardId });
};

const getCards = async (searchObj) => {
  return Card.find(searchObj).populate([
    {
      path: "tradeId",
      select: "title isAvailable",
    },
  ]);
};

const getCardsPopulateData = async (searchObj, populateObj, sort, limit) => {
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
  return Card.aggregate(criteria);
};

module.exports = {
  createCard,
  updateCard,
  updateBulkCards,
  deleteCardByCardId,
  getCards,
  getCardsPopulateData,
  getCardsAggregateData,
};
