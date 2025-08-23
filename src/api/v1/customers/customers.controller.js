const express = require('express');
const router = express.Router();
const customersService = require('./customers.service');
const { extractTokenDetails } = require("../../../common/services/auth.service");

router.post('/', customersService.createCustomer);
router.get('/', customersService.searchCustomers);
router.get('/:customerId', customersService.getCustomerById);
router.patch('/:customerId', customersService.updateCustomer);
router.patch('/:customerId/status', extractTokenDetails, customersService.updateCustomerStatus);
router.get('/:customerId/bookings', customersService.getCustomerBookings);
router.get('/:customerId/services', customersService.getCustomerServices);

module.exports = router;