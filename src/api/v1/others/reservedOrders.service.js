const ReservedOrdersRepository = require("../../../database/mongo/repositories/reserved-orders.repository");

// CREATE
module.exports.createReservedOrder = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newReservedOrderResponse =
      await ReservedOrdersRepository.createReservedOrder(req.body);
    res.json(newReservedOrderResponse);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// READ
module.exports.getReservedOrders = async (req, res) => {
  const filterCriteria = {};
  const reservedOrdersList = await ReservedOrdersRepository.getReservedOrders(
    filterCriteria
  );
  res.json(reservedOrdersList);
};

// UPDATE
module.exports.updateReservedOrder = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }
    const updateResp = await ReservedOrdersRepository.updateReservedOrder(
      { _id: req.params.reservedOrderId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteReservedOrder = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }
    const deleteResp =
      await ReservedOrdersRepository.deleteReservedOrderByReservedOrderId({
        _id: req.params.reservedOrderId,
      });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
