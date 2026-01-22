const express = require('express');
const router = express.Router();
const authService = require('./auth.service');

// Auth routes
router.post('/login', authService.authenticateUser);
router.post('/reset-password', authService.resetPassword);
router.post('/refresh-token', authService.generateTokenFromRefreshToken);
router.post('/check-admin', authService.checkIsAdmin);

// Admin management routes
router.post('/create-admin', authService.createAdminUser);
router.post('/sync-users', authService.syncMongoUsers);

// Debug route (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug-users', authService.debugUsers);
}

module.exports = router;
