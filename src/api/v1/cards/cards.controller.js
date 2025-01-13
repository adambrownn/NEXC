const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express();

const cardsService = require("./cards.service");

router
  .route("/")
  // get all cards
  .get(cardsService.getCards)
  // create card
  .post(extractTokenDetails, cardsService.createCard);

router
  .route("/:cardId")
  // get one populated card
  .get(cardsService.getCardById)
  // filter cards
  .post(extractTokenDetails, cardsService.getCards)
  // update card
  .put(extractTokenDetails, cardsService.updateCard)
  // delete card by id
  .delete(extractTokenDetails, cardsService.deleteCard);

module.exports = router;
