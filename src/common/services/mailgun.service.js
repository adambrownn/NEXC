const mailgun = require("mailgun-js");

// SECURITY FIX: Use environment variables for credentials
const DOMAIN = process.env.MAILGUN_DOMAIN || "nexc.co.uk";
const API_KEY = process.env.MAILGUN_API_KEY;
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || `noreply@${DOMAIN}`;
const FROM_NAME = process.env.MAILGUN_FROM_NAME || "NEXC Construction Services";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://localhost:3000";

// Validate environment variables
if (!API_KEY) {
  console.error("❌ [Mailgun] MAILGUN_API_KEY environment variable is required for Mailgun service.");
  console.error("❌ [Mailgun] Email functionality will be disabled.");
}

let mg = null;

if (API_KEY) {
  console.log('🔧 [Mailgun] Initializing with configuration:');
  console.log('🔧 [Mailgun] Domain:', DOMAIN);
  console.log('🔧 [Mailgun] From Email:', FROM_EMAIL);
  console.log('🔧 [Mailgun] From Name:', FROM_NAME);
  console.log('🔧 [Mailgun] API Key:', API_KEY ? '✓ Configured' : '✗ Missing');

  mg = mailgun({
    apiKey: API_KEY,
    domain: DOMAIN,
  });

  console.log('✅ [Mailgun] Service initialized successfully');
}

// Email templates
const EMAIL_TEMPLATES = {
  passwordResetOTP: {
    subject: "Your NEXC Password Reset Code",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: white; padding: 20px; border-radius: 8px; margin: 20px 0; color: #1976d2; border: 2px dashed #1976d2; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .info-box { background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset Code</h1>
            <p>NEXC Construction Services</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.name || 'User'},</h2>
            
            <p>We received a request to reset the password for your NEXC account associated with <strong>${data.email}</strong>.</p>
            
            <p>Your password reset verification code is:</p>
            
            <div class="otp-code">${data.otpCode}</div>
            
            <div class="info-box">
              <strong>How to use this code:</strong>
              <ol style="margin: 10px 0;">
                <li>Go to the password reset page</li>
                <li>Enter this 6-digit code</li>
                <li>Create your new password</li>
              </ol>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul style="margin: 10px 0;">
                <li>This code will expire in <strong>15 minutes</strong></li>
                <li>If you didn't request this reset, please ignore this email and secure your account</li>
                <li><strong>Never share this code with anyone</strong> - NEXC staff will never ask for it</li>
                <li>For security, this code can only be used once</li>
              </ul>
            </div>
            
            <p>If you have any questions or concerns, please contact our support team immediately.</p>
            
            <p>Best regards,<br>The NEXC Team</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} NEXC Construction Services. All rights reserved.</p>
            <p>This is an automated security message, please do not reply to this email.</p>
            <p>If you didn't request this code, your account may be at risk. Please contact support.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (data) => `
      NEXC Construction Services - Password Reset Code
      
      Hello ${data.name || 'User'},
      
      We received a request to reset the password for your NEXC account associated with ${data.email}.
      
      Your password reset verification code is: ${data.otpCode}
      
      How to use this code:
      1. Go to the password reset page
      2. Enter this 6-digit code
      3. Create your new password
      
      IMPORTANT SECURITY INFORMATION:
      - This code will expire in 15 minutes
      - If you didn't request this reset, please ignore this email and secure your account
      - Never share this code with anyone - NEXC staff will never ask for it
      - For security, this code can only be used once
      
      If you have any questions or concerns, please contact our support team immediately.
      
      Best regards,
      The NEXC Team
      
      © ${new Date().getFullYear()} NEXC Construction Services. All rights reserved.
      This is an automated security message, please do not reply to this email.
    `,
  },
  passwordReset: {
    subject: "Reset Your NEXC Account Password",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset Request</h1>
            <p>NEXC Construction Services</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.name || 'User'},</h2>
            
            <p>We received a request to reset the password for your NEXC account associated with <strong>${data.email}</strong>.</p>
            
            <p>To reset your password, please click the button below:</p>
            
            <p style="text-align: center;">
              <a href="${data.resetLink}" class="button">Reset My Password</a>
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${data.resetLink}</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The NEXC Team</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} NEXC Construction Services. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (data) => `
      NEXC Construction Services - Password Reset Request
      
      Hello ${data.name || 'User'},
      
      We received a request to reset the password for your NEXC account associated with ${data.email}.
      
      To reset your password, please visit this link:
      ${data.resetLink}
      
      IMPORTANT:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - Never share this link with anyone
      
      If you have any questions, please contact our support team.
      
      Best regards,
      The NEXC Team
      
      © ${new Date().getFullYear()} NEXC Construction Services. All rights reserved.
    `
  },
  
  welcomeEmail: {
    subject: "Welcome to NEXC Construction Services",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to NEXC</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ Welcome to NEXC!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Welcome to NEXC Construction Services! Your account has been created successfully.</p>
            <p>You can now access your dashboard and start managing your construction certifications.</p>
            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/dashboard" class="button">Access Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

/**
 * Send password reset OTP email
 * @param {string} destinationEmail - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} userName - User's name
 */
module.exports.sendPasswordResetOTP = async (destinationEmail, otpCode, userName = null) => {
  try {
    if (!mg || !API_KEY) {
      const error = new Error('Mailgun service not configured. Please set MAILGUN_API_KEY in environment variables.');
      console.error('❌ [Mailgun]', error.message);
      throw error;
    }

    console.log('📧 [Mailgun] Sending password reset OTP to:', destinationEmail);
    console.log('📧 [Mailgun] OTP Code:', otpCode);
    console.log('📧 [Mailgun] From:', `${FROM_NAME} <${FROM_EMAIL}>`);
    console.log('📧 [Mailgun] Domain:', DOMAIN);
    
    const template = EMAIL_TEMPLATES.passwordResetOTP;
    const templateData = {
      name: userName,
      email: destinationEmail,
      otpCode: otpCode
    };
    
    const emailData = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: destinationEmail,
      subject: template.subject,
      html: template.getHtml(templateData),
      text: template.getText(templateData),
    };

    console.log('📧 [Mailgun] Email data prepared, sending...');

    return new Promise((resolve, reject) => {
      mg.messages().send(emailData, function (error, body) {
        if (error) {
          console.error('❌ [Mailgun] Failed to send password reset OTP:', error);
          console.error('❌ [Mailgun] Error details:', JSON.stringify(error, null, 2));
          return reject(error);
        }
        console.log('✅ [Mailgun] Password reset OTP sent successfully:', body.id);
        console.log('✅ [Mailgun] Response:', JSON.stringify(body, null, 2));
        return resolve(body);
      });
    });
  } catch (error) {
    console.error('❌ [Mailgun] Error in sendPasswordResetOTP:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} destinationEmail - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 */
module.exports.sendPasswordResetEmail = async (destinationEmail, resetToken, userName = null) => {
  try {
    console.log('📧 Sending password reset email to:', destinationEmail);
    
    const resetLink = `${FRONTEND_URL}/auth/reset-password-confirm?token=${resetToken}`;
    
    const template = EMAIL_TEMPLATES.passwordReset;
    const templateData = {
      name: userName,
      email: destinationEmail,
      resetLink: resetLink
    };
    
    const emailData = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: destinationEmail,
      subject: template.subject,
      html: template.getHtml(templateData),
      text: template.getText(templateData),
    };

    return new Promise((resolve, reject) => {
      mg.messages().send(emailData, function (error, body) {
        if (error) {
          console.error('❌ Failed to send password reset email:', error);
          return reject(error);
        }
        console.log('✅ Password reset email sent successfully:', body.id);
        return resolve(body);
      });
    });
  } catch (error) {
    console.error('❌ Error in sendPasswordResetEmail:', error);
    throw new Error("Unable to send password reset email");
  }
};

/**
 * Send welcome email to new users
 * @param {string} destinationEmail - Recipient email
 * @param {string} userName - User's name
 */
module.exports.sendWelcomeEmail = async (destinationEmail, userName) => {
  try {
    console.log('📧 Sending welcome email to:', destinationEmail);
    
    const template = EMAIL_TEMPLATES.welcomeEmail;
    const templateData = {
      name: userName,
      email: destinationEmail
    };
    
    const emailData = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: destinationEmail,
      subject: template.subject,
      html: template.getHtml(templateData),
    };

    return new Promise((resolve, reject) => {
      mg.messages().send(emailData, function (error, body) {
        if (error) {
          console.error('❌ Failed to send welcome email:', error);
          return reject(error);
        }
        console.log('✅ Welcome email sent successfully:', body.id);
        return resolve(body);
      });
    });
  } catch (error) {
    console.error('❌ Error in sendWelcomeEmail:', error);
    throw new Error("Unable to send welcome email");
  }
};

/**
 * Test email functionality
 */
module.exports.testEmailConnection = async () => {
  try {
    console.log('🧪 Testing Mailgun connection...');
    
    const testData = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: FROM_EMAIL, // Send test email to sender
      subject: 'NEXC Email Service Test',
      text: 'This is a test email to verify Mailgun configuration.',
      html: '<h1>Email Service Test</h1><p>This is a test email to verify Mailgun configuration.</p>'
    };

    return new Promise((resolve, reject) => {
      mg.messages().send(testData, function (error, body) {
        if (error) {
          console.error('❌ Email service test failed:', error);
          return reject(error);
        }
        console.log('✅ Email service test successful:', body.id);
        return resolve(body);
      });
    });
  } catch (error) {
    console.error('❌ Error testing email connection:', error);
    throw error;
  }
};

// Export configuration for debugging
module.exports.getConfig = () => ({
  domain: DOMAIN,
  fromEmail: FROM_EMAIL,
  fromName: FROM_NAME,
  hasApiKey: !!API_KEY,
  frontendUrl: FRONTEND_URL
});
