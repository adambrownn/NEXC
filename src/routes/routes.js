const express = require('express');
const router = express.Router();

// JSON body parser middleware - applied to specific routes only
const jsonParser = express.json();
const urlencodedParser = express.urlencoded({ extended: true });

// Import auth service methods directly (this works since we have the auth.service.js file)
const authService = require('../api/v1/auth/auth.service');

// Import existing controllers that we know exist
const userController = require('../api/v1/user/user.controller');
const ordersController = require('../api/v1/orders/orders.controller'); 
const testsController = require('../api/v1/tests/tests.controller');
const cardsController = require('../api/v1/cards/cards.controller');
const coursesController = require('../api/v1/courses/courses.controller');
const centersController = require('../api/v1/centers/centers.controller');
const tradesController = require('../api/v1/trades/trades.controller');
const tradeAssociationsController = require('../api/v1/trades/tradeServiceAssociations.controller');
const qualificationsController = require('../api/v1/qualifications/qualifications.controller');
const applicationsController = require('../api/v1/applications/applications.controller');
const chatController = require('../api/v1/chat/chat.controller');
const ticketsController = require('../api/v1/tickets/tickets.controller');
const notificationsController = require('../api/v1/notifications/notification.controller');
const analyticsController = require('../api/v1/analytics/analytics.controller');
const techniciansController = require('../api/v1/technicians/technicians.controller');
const voiceController = require('../api/v1/voice/voice.controller');

// Blog and Media controllers
let blogController = null;
let mediaController = null;

try {
  blogController = require('../api/v1/blogs/blog.controller');
} catch (error) {
  console.log('[Routes] Blog controller not found');
}

try {
  mediaController = require('../api/v1/media/media.controller');
} catch (error) {
  console.log('[Routes] Media controller not found');
}

// Try to import optional controllers (with error handling)
let faqsController = null;
let customersController = null;

try {
  faqsController = require('../api/v1/others/faqs.controller');
} catch (error) {
  console.log('[Routes] FAQs controller not found, using service methods directly');
}

try {
  customersController = require('../api/v1/customers/customers.controller');
} catch (error) {
  console.log('[Routes] Customers controller not found, using service methods directly');
}

// Auth routes - Mount these first for priority with debugging
router.post('/auth/login', jsonParser, (req, res, next) => {
  console.log('🔍 [Routes] Login request received');
  next();
}, authService.authenticateUser);

router.post('/auth/create-admin', jsonParser, (req, res, next) => {
  console.log('🔍 [Routes] Create admin request received');
  console.log('🔍 [Routes] Request body:', req.body);
  next();
}, authService.createAdminUser);

router.post('/auth/reset-password', jsonParser, (req, res, next) => {
  console.log('🔍 [Routes] Password reset request received');
  console.log('🔍 [Routes] Request email:', req.body.email);
  next();
}, authService.resetPassword);

router.post('/auth/reset-password-otp/request', jsonParser, (req, res, next) => {
  console.log('🔍 [Routes] Password reset OTP request received');
  console.log('🔍 [Routes] Request email:', req.body.email);
  next();
}, authService.requestPasswordResetOTP);

router.post('/auth/reset-password-otp/verify', jsonParser, (req, res, next) => {
  console.log('🔍 [Routes] Password reset OTP verify received');
  console.log('🔍 [Routes] Request email:', req.body.email);
  next();
}, authService.resetPasswordWithOTP);

router.post('/auth/confirm-password-reset', jsonParser, (req, res, next) => {
  console.log('🔍 [Routes] Password reset confirmation received');
  next();
}, authService.resetPassword); // This will need to be updated in backend

router.post('/auth/sync-users', jsonParser, authService.syncMongoUsers);
router.post('/auth/refresh-token', jsonParser, authService.generateTokenFromRefreshToken);
router.post('/auth/check-admin', jsonParser, authService.checkIsAdmin);

// Debug route (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/auth/debug-users', authService.debugUsers);
  
  // Add email testing route - Updated for Resend with better error handling
  router.get('/email/test', async (req, res) => {
    try {
      const emailService = require('../common/services/email.service');
      
      // Check if email service is configured
      if (!emailService.isEmailServiceConfigured()) {
        return res.status(400).json({
          success: false,
          service: 'Resend API',
          error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.',
          config: emailService.getConfig(),
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('🧪 Testing Resend email service...');
      
      const result = await emailService.testEmailConnection();
      const config = emailService.getConfig();
      
      res.json({
        success: true,
        message: 'Email test sent successfully via Resend! 🎉',
        service: 'Resend API',
        domain: 'nexc.co.uk',
        result: result,
        config: config,
        emailId: result.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Resend email test failed:', error);
      try {
        const emailService = require('../common/services/email.service');
        res.status(500).json({
          success: false,
          service: 'Resend API',
          error: error.message,
          config: emailService.getConfig(),
          timestamp: new Date().toISOString()
        });
      } catch (configError) {
        res.status(500).json({
          success: false,
          service: 'Resend API',
          error: error.message,
          configError: 'Failed to get email service config',
          timestamp: new Date().toISOString()
        });
      }
    }
  });
}

// Mount existing controllers with JSON parsing (NOT for media - it uses multer)
router.use('/user', jsonParser, urlencodedParser, userController);
router.use('/orders', jsonParser, urlencodedParser, ordersController);
router.use('/tests', jsonParser, urlencodedParser, testsController);
router.use('/cards', jsonParser, urlencodedParser, cardsController);
router.use('/courses', jsonParser, urlencodedParser, coursesController);
router.use('/centers', jsonParser, urlencodedParser, centersController);
router.use('/trades', jsonParser, urlencodedParser, tradesController);
router.use('/trade-associations', jsonParser, urlencodedParser, tradeAssociationsController);
router.use('/qualifications', jsonParser, urlencodedParser, qualificationsController);
router.use('/applications', jsonParser, urlencodedParser, applicationsController);
router.use('/chat', jsonParser, urlencodedParser, chatController);
router.use('/tickets', jsonParser, urlencodedParser, ticketsController);
router.use('/notifications', jsonParser, urlencodedParser, notificationsController);
router.use('/analytics', jsonParser, urlencodedParser, analyticsController);
router.use('/technicians', jsonParser, urlencodedParser, techniciansController);
router.use('/voice', voiceController);

// Mount blog and media controllers if they exist
if (blogController) {
  router.use('/blogs', jsonParser, urlencodedParser, blogController);
  console.log('[Routes] Blog controller mounted at /v1/blogs');
}

if (mediaController) {
  // CRITICAL: Do NOT apply JSON parser to media routes - multer handles multipart/form-data
  router.use('/media', mediaController);
  console.log('[Routes] Media controller mounted at /v1/media (without JSON parser for multer)');
}

// Mount optional controllers if they exist
if (faqsController) {
  router.use('/faqs', jsonParser, urlencodedParser, faqsController);
} else {
  // If controller doesn't exist, add basic FAQ routes using service methods directly
  const faqsService = require('../api/v1/others/faqs.service');
  const { extractTokenDetails } = require('../common/services/auth.service');
  
  router.get('/faqs', faqsService.getFaqs);
  router.post('/faqs', jsonParser, extractTokenDetails, faqsService.createFaq);
  router.put('/faqs/:faqId', jsonParser, extractTokenDetails, faqsService.updateFaq);
  router.delete('/faqs/:faqId', extractTokenDetails, faqsService.deleteFaq);
}

if (customersController) {
  router.use('/customers', jsonParser, urlencodedParser, customersController);
} else {
  console.log('[Routes] Customers functionality not available - controller missing');
}

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Default route for API info
router.get('/', (req, res) => {
  res.json({
    message: 'NEXC API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/auth/*',
      users: '/user/*',
      orders: '/orders/*',
      tests: '/tests/*',
      cards: '/cards/*',
      courses: '/courses/*',
      centers: '/centers/*',
      trades: '/trades/*',
      qualifications: '/qualifications/*',
      analytics: '/analytics/*',
      chat: '/chat/*',
      tickets: '/tickets/*',
      notifications: '/notifications/*',
      technicians: '/technicians/*',
      faqs: '/faqs/*',
      health: '/health'
    }
  });
});

console.log('[Routes] All routes configured successfully');

module.exports = router;