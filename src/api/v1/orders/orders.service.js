const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
var ObjectId = mongoose.Types.ObjectId;

const ordersRepository = require("../../../database/mongo/repositories/orders.repository");
const opayoService = require("../../../common/services/opayo.service");

module.exports.getAggregateOrders = async (req, res) => {
  var startDate = req.body.startDate
    ? new Date(req.body.startDate)
    : new Date("2020-01-01");
  var endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(); // TODO

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const match = {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate },
    },
  };

  if (req.body.sortByStatus) {
    match["$match"]["$or"] = [
      { paymentStatus: req.body.paymentStatus },
      { orderCheckPoint: req.body.orderCheckPoint },
    ];
  }

  const sort = {
    $sort: {
      createdAt: -1,
    },
  };

  const limit = {
    $limit: 25,
  };

  const customerLookup = {
    $lookup: {
      from: "users",
      localField: "customerId",
      foreignField: "_id",
      as: "customerData",
    },
  };

  const project = {
    $project: {
      _id: 1,
      paymentStatus: 1,
      orderSummary: 1,
      paymentSummary: 1,
      orderCheckPoint: 1,
      address: 1,
      zipcode: 1,
      dob: 1,
      NINumber: 1,
      items: 1,
      itemsTotal: 1,
      grandTotalToPay: 1,
      grandTotalPaid: 1,

      createdAt: 1,
      updatedAt: 1,

      customerData: {
        _id: 1,
        email: 1,
        phoneNumber: 1,
        name: 1,
        profileImage: 1,
      },
    },
  };

  const Orders = await ordersRepository.getAggregateOrders([
    match,
    sort,
    limit,
    customerLookup,
    project,
  ]);
  res.json(Orders);
};

module.exports.getOrders = async (req, res) => {
  // userid, restaurantId, deliveryBoy->userId
  const searchReqObj = {};
  searchReqObj["$or"] = [
    {
      customerId: req.query.searchId,
    },
  ];

  var startDate = req.query.startDate
    ? new Date(req.query.startDate)
    : new Date("2021-01-01"); // TODO
  var endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  searchReqObj.createdAt = { $gte: startDate, $lte: endDate };

  const Orders = await ordersRepository.getOrdersPopulateData(searchReqObj, [
    {
      path: "customerId",
      select: "email phoneNumber name profileImage",
    },
  ]);
  res.json(Orders);
};

module.exports.getOrderDetails = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params?.orderId)) {
      throw new Error("Invalid Order id");
    }

    const OrderData = await ordersRepository.getOrdersPopulateData(
      {
        _id: req.params.orderId,
      },
      [
        {
          path: "customerId",
          select: "email phoneNumber name profileImage",
        },
        {
          path: "items.itemId",
          select: "name category image",
        },
      ]
    );
    res.json(OrderData[0]);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

module.exports.getOrdersCount = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.query?.searchId)) {
      throw new Error("Invalid Order id");
    }

    const [totalOrders, delivered, rejected] = await Promise.all([
      await ordersRepository.getOrdersCount({
        customerId: req.query.searchId,
      }),
      await ordersRepository.getOrdersCount({
        customerId: req.query.searchId,
        orderCheckPoint: 4,
      }),
      await ordersRepository.getOrdersCount({
        customerId: req.query.searchId,
        orderCheckPoint: 5,
      }),
    ]);

    res.json([totalOrders, delivered, rejected]);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

module.exports.createOrder = async (req, res) => {
  try {
    const reqObj = req.body;

    const createOrderResp = await ordersRepository.createOrder(reqObj);

    res.json(createOrderResp);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

module.exports.updateOrderData = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.orderId)) {
      throw new Error("Invalid Order");
    }

    const updateReqObj = req.body;
    updateReqObj.updatedAt = Date.now();

    const updatedOrderResp = await ordersRepository.updateOrder(
      {
        _id: req.params.orderId,
      },
      updateReqObj,
      {}
    );

    if (updatedOrderResp) {
      res.json(updatedOrderResp);
    } else {
      throw new Error("Order not updated or Order not Exists");
    }
  } catch (err) {
    console.log(err);
    res.json({ err: err.message });
  }
};

module.exports.orderPayment = async (req, res) => {
  try {
    const reqObj = req.body;

    const updateReqObj = {
      customer: reqObj.customer,

      paymentStatus: 4,
      orderCheckPoint: 6,
      paymentMethod: reqObj.paymentMethod,

      items: reqObj.orderDetails?.items,
      itemsTotal: parseFloat(reqObj.orderDetails.itemsTotal),
      grandTotalToPay: parseFloat(reqObj.orderDetails.grandTotalToPay),

      cardInfo: reqObj.cardInfo || {},

      updatedAt: Date.now(),
    };

    // save details pre order
    const updatedOrderResp = await ordersRepository.updateOrder(
      {
        _id: req.params.orderId,
      },
      updateReqObj,
      {}
    );
    if (!updatedOrderResp) {
      throw new Error("Unable to Initiate Payment, Please contact Support");
    }
    // initiate payment
    const transactionResp = await opayoService.payOnSagePay(
      {
        cardholderName: reqObj.cardInfo.cardholderName,
        cardNumber: reqObj.cardInfo.cardNumber,
        expiryDate: reqObj.cardInfo.expiryDate,
        securityCode: reqObj.cardInfo.securityCode,
      },
      parseFloat(reqObj.orderDetails.grandTotalToPay),
      {
        description: "CSL Transaction",
        customerFirstName: reqObj.customer.name,
        customerLastName: reqObj.customer.name,
        address: reqObj.customer.address,
        city: reqObj.customer.address,
        postalCode: reqObj.customer.zipcode,
      }
    );
    if (transactionResp.status != "Ok") {
      throw new Error("Transaction Failed");
    } else {
      // transaction successfull
      const tranReqObj = {
        paymentStatus: 2,
        paymentSummary: transactionResp,
        orderCheckPoint: 4,
        grandTotalPaid: transactionResp.amount.totalAmount,
        updatedAt: Date.now(),
      };
      const updatedTansactionOrderResp = await ordersRepository.updateOrder(
        {
          _id: req.params.orderId,
        },
        tranReqObj,
        {}
      );
      if (!updatedTansactionOrderResp) {
        throw new Error("Unable to Initiate Payment, Please contact Support");
      } else {
        res.json(updatedTansactionOrderResp);
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

module.exports.deleteOrder = async (req, res) => {
  // only admin can delete
  if (!["superadmin", "admin"].includes(req.user.accountType)) {
    throw new Error("You do not have access");
  }

  const deleteResp = await ordersRepository.deleteOrderById({
    _id: req.params.orderId,
  });
  res.json(deleteResp);
};
