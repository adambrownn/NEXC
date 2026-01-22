const express = require('express');
const router = express.Router();
const customersService = require('./customers.service');
const { extractTokenDetails } = require("../../../common/services/auth.service");

// All customer endpoints now require authentication (organization access only)
// This ensures only authenticated staff/users from the organization can access customer data
router.post('/', extractTokenDetails, customersService.createCustomer);
router.get('/', extractTokenDetails, customersService.searchCustomers);
router.get('/:customerId', extractTokenDetails, customersService.getCustomerById);
router.patch('/:customerId', extractTokenDetails, customersService.updateCustomer);
router.patch('/:customerId/status', extractTokenDetails, customersService.updateCustomerStatus);
router.delete('/:customerId', extractTokenDetails, customersService.deleteCustomer);
router.get('/:customerId/bookings', extractTokenDetails, customersService.getCustomerBookings);
router.get('/:customerId/services', extractTokenDetails, customersService.getCustomerServices);
router.get('/:customerId/history', extractTokenDetails, customersService.getCustomerHistory);

// Voice integration - lookup customer by phone number
router.get('/by-phone/:phoneNumber', extractTokenDetails, customersService.getCustomerByPhone);

module.exports = router;