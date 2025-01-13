const cardRepository = require("../../../database/mongo/repositories/cards.repository");

// CREATE
module.exports.createCard = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const createCardResp = await cardRepository.createCard(req.body);
    res.json(createCardResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// READ
module.exports.getCards = async (req, res) => {
  // TODO: filter experiment
  // const searchReqObj = {};

  // if (req.body.filterCriteria) {
  //   searchReqObj["$or"] = [
  //     {
  //       title: {
  //         $regex: `${reqObj.searchString}`,
  //         $options: "i",
  //       },
  //     },
  //     {
  //       tagline: {
  //         $regex: `${reqObj.searchString}`,
  //         $options: "i",
  //       },
  //     },
  //   ];
  // }

  const filterCriteria = {};
  if (req.query.tradeId) {
    filterCriteria.tradeId = req.query.tradeId;
  }

  const cardsList = await cardRepository.getCards(filterCriteria);
  res.json(cardsList);
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
    const updateResp = await cardRepository.updateCard(
      { _id: req.params.cardId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteCard = async (req, res) => {
  try {
    const deleteResp = await cardRepository.deleteCardByCardId({
      _id: req.params.cardId,
    });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
