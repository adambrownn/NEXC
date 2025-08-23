const Orders = require("../schemas/Orders.schema");

// CREATE
exports.createOrder = async (orderData) => {
  try {
    const order = new Orders(orderData);
    return await order.save();
  } catch (error) {
    throw error;
  }
};

// READ
exports.getOrders = async (query = {}) => {
  try {
    return await Orders.find(query)
      .populate('customerId', 'firstName lastName email phoneNumber')
      .populate('createdBy', 'name email');
  } catch (error) {
    throw error;
  }
};

exports.getOrderById = async (orderId) => {
  try {
    return await Orders.findById(orderId)
      .populate('customerId', 'firstName lastName email phoneNumber')
      .populate('createdBy', 'name email');
  } catch (error) {
    throw error;
  }
};

exports.getCustomerOrders = async (customerId) => {
  try {
    return await Orders.find({ customerId })
      .populate('customerId', 'firstName lastName email phoneNumber')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

// UPDATE
exports.updateOrder = async (orderId, updateData) => {
  try {
    return await Orders.findByIdAndUpdate(
      orderId,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    ).populate('customerId', 'firstName lastName email phoneNumber')
     .populate('createdBy', 'name email');
  } catch (error) {
    throw error;
  }
};

// DELETE
exports.deleteOrder = async (orderId) => {
  try {
    return await Orders.findByIdAndDelete(orderId);
  } catch (error) {
    throw error;
  }
};

// Export the model for use in services
exports.Orders = Orders;
