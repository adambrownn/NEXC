const bcrypt = require("bcryptjs");
const userRepository = require("../../../database/mongo/repositories/user.repository");
const authService = require("../../../common/services/auth.service");
const userService = require("../user/user.service");
const emailService = require("../../../common/services/email.service");

module.exports.authenticateUser = async (req, res) => {
  try {
    const reqObj = req.body;

    let user = {};
    let emailFromToken = "";

    switch (reqObj.loginType) {
      case "email": {
        emailFromToken = reqObj.email;
        // Find user by email regardless of socialIdentityProvider
        // This allows users to login even if they signed up through different methods
        const User = require('../../../database/mongo/schemas/Users.schema');
        user = await User.findOne({ 
          email: reqObj.email.toLowerCase().trim(),
          // Only allow email/password login for users without social provider or with email provider
          $or: [
            { socialIdentityProvider: '' },
            { socialIdentityProvider: 'email' },
            { socialIdentityProvider: 'visitor' },
            { socialIdentityProvider: { $exists: false } }
          ]
        });
        
        if (!user) {
          throw new Error("Email doesn't exist. Please register.");
        }
        const isPasswordMatched = await bcrypt.compare(
          reqObj.password,
          user.password
        );
        if (!isPasswordMatched) {
          throw new Error("Incorrect password.");
        }
        break;
      }

      // Add phone login case
      case "phone": {
        // Use phone as identifier if email isn't available
        emailFromToken = reqObj.phone;
        user = await userRepository.getUserByPhoneOnlyForLogin(reqObj.phone);
        if (!user) {
          throw new Error("Phone number doesn't exist. Please register.");
        }
        const isPasswordMatched = await bcrypt.compare(
          reqObj.password,
          user.password
        );
        if (!isPasswordMatched) {
          throw new Error("Incorrect password.");
        }
        // If user has email, use that for token generation
        if (user.email) {
          emailFromToken = user.email;
        }
        break;
      }

      case "google": {
        const googlePayload = await userService.verifyGoogleToken(
          reqObj.socialIdentityToken
        );
        if (googlePayload.email) {
          emailFromToken = googlePayload.email;
          user = await userRepository.getUserByEmailOnlyForLogin(
            googlePayload.email,
            reqObj.loginType
          );
        }
        break;
      }
    }

    // Handle both Mongoose documents and plain objects
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userDetails } = user.toObject ? user.toObject() : user;

    // Update lastLogin timestamp
    await userRepository.updateUser(
      { _id: userDetails._id },
      { lastLogin: new Date() },
      {}
    );

    // Update token generation to include phone if available
    const { accessToken, refreshToken } = await authService.generateJwtToken({
      userId: userDetails._id,
      name: (userDetails.name || userDetails.email || 'User').toLowerCase(),
      email: userDetails?.email?.toLowerCase(),
      phone: userDetails?.phoneNumber, // Add phone to token if available
      accountType: (userDetails.accountType || 'user').toLowerCase(),
    });

    //rename _id to userId before sending
    userDetails.userId = userDetails._id;
    delete userDetails._id;

    res.json({
      user: {
        userId: userDetails.userId,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber, // Add phone to response
        name: userDetails.name,
        displayName: userDetails.displayName,
        profileImage: userDetails.profileImage,
        profileAvatar: userDetails.profileAvatar,
        accountType: userDetails.accountType,
        role: userDetails.role,
        company: userDetails.company,
        department: userDetails.department,
        location: userDetails.location,
        bio: userDetails.bio,
        status: userDetails.status,
        createdAt: userDetails.createdAt,
        lastLogin: new Date(), // Use current timestamp since we just updated it
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

// reset Password
module.exports.resetPassword = async (req, res) => {
  try {
    console.log('🔑 Password reset request received for:', req.body.email);
    
    // Check if this is a password reset request or confirmation
    if (req.body.jwtToken) {
      // This is a password reset confirmation with token
      const decodedToken = await authService.verifyToken(req.body.jwtToken);
      if (!decodedToken.email) {
        console.error("No Email in decoded token");
        throw new Error("Invalid Token");
      }
      const updatePasswordRes = await userService.resetPassword(
        decodedToken.email,
        req.body.password
      );
      if (!updatePasswordRes) {
        throw new Error("Unable to reset password");
      }
      res.json({ updated: true, message: "Password updated successfully" });
    } else if (req.body.email) {
      // This is a password reset request - send reset email
      const email = req.body.email.toLowerCase().trim();
      
      // Check if user exists
      const existingUser = await userRepository.getUserDetailsByCriteria({
        email: email,
      });

      if (existingUser.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email address"
        });
      }

      const user = existingUser[0];

      // Generate password reset token with 1 hour expiry
      const resetToken = await authService.generateJwtToken({
        email: email,
        purpose: 'password_reset',
        userId: user._id
      }, '1h'); // 1 hour expiry

      try {
        // Try to send password reset email using Resend
        console.log('📧 Attempting to send password reset email via Resend...');
        
        // Import email service here to avoid module load issues
        const emailService = require("../../../common/services/email.service");
        
        // Check if email service is configured
        if (emailService.isEmailServiceConfigured()) {
          await emailService.sendPasswordResetEmail(
            email, 
            resetToken.accessToken, 
            user.name
          );
          
          console.log('✅ Password reset email sent successfully to:', email);
          
          res.json({
            success: true,
            message: "Password reset instructions have been sent to your email address"
          });
        } else {
          // Email service not configured - return success but log warning
          console.warn('⚠️ Email service not configured - returning token for development');
          
          res.json({
            success: true,
            message: "Password reset instructions would be sent to your email (Email service not configured)",
            // Include debug info in development when email service is not configured
            ...(process.env.NODE_ENV !== 'production' && {
              debug: {
                resetToken: resetToken.accessToken,
                emailServiceConfigured: false,
                message: "Email service not configured. Set RESEND_API_KEY in environment variables."
              }
            })
          });
        }
      } catch (emailError) {
        console.error('❌ Failed to send password reset email:', emailError);
        
        // Return success to user for security (don't reveal email sending failures)
        // But log the error for debugging
        res.json({
          success: true,
          message: "If an account with this email exists, password reset instructions have been sent",
          // Include debug info in development
          ...(process.env.NODE_ENV !== 'production' && {
            debug: {
              emailError: emailError.message,
              resetToken: resetToken.accessToken // For development testing
            }
          })
        });
      }
    } else {
      throw new Error("Invalid request - missing email or token");
    }
  } catch (err) {
    console.error('❌ Password reset error:', err);
    res.status(400).json({ 
      success: false,
      err: err.message,
      message: err.message
    });
  }
};

// OTP-based password reset - Step 1: Request OTP
module.exports.requestPasswordResetOTP = async (req, res) => {
  console.log('🚀 [Auth] requestPasswordResetOTP function called');
  console.log('🚀 [Auth] Request body:', JSON.stringify(req.body));
  
  try {
    const { email } = req.body;
    
    console.log('🔍 [Auth] Extracted email:', email);
    
    if (!email) {
      console.error('❌ [Auth] Email is missing from request');
      throw new Error("Email is required");
    }

    console.log('🔍 [Auth] Searching for user with email:', email);
    
    // Find user by email - don't filter by socialIdentityProvider for password reset
    // Users might have signed up with different methods but should be able to reset password
    const User = require('../../../database/mongo/schemas/Users.schema');
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    console.log('🔍 [Auth] User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('🔍 [Auth] User ID:', user._id);
      console.log('🔍 [Auth] User Name:', user.name);
      console.log('🔍 [Auth] User Provider:', user.socialIdentityProvider);
    }
    
    if (!user) {
      console.log('⚠️ [Auth] User not found, returning generic success message');
      // For security, don't reveal if email exists
      return res.json({
        success: true,
        message: "If an account with this email exists, a verification code has been sent"
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry to 15 minutes
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    console.log('🔍 [Auth] Generated OTP:', otpCode);
    console.log('🔍 [Auth] OTP Expiry:', otpExpiry);

    // Save OTP to user document using $set
    await User.findByIdAndUpdate(
      user._id, 
      { 
        $set: {
          passwordResetOTP: otpCode,
          passwordResetOTPExpires: otpExpiry
        }
      },
      { new: true }
    );

    console.log('✅ [Auth] OTP saved to database for user:', user._id);

    // Send OTP via email
    try {
      console.log('🔍 [Auth] Attempting to send OTP email...');
      console.log('🔍 [Auth] Email:', email);
      console.log('🔍 [Auth] OTP Code:', otpCode);
      console.log('🔍 [Auth] User Name:', user.name);
      
      const emailResult = await emailService.sendPasswordResetOTP(email, otpCode, user.name);
      
      console.log('✅ Password reset OTP sent successfully to:', email);
      console.log('✅ Email result:', emailResult);
      
      res.json({
        success: true,
        message: "If an account with this email exists, a verification code has been sent",
        // Include debug info in development
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            otpCode: otpCode,
            expiresAt: otpExpiry,
            emailSent: true,
            emailResult: emailResult
          }
        })
      });
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      console.error('❌ Error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
      
      // For security, still return success message
      res.json({
        success: true,
        message: "If an account with this email exists, a verification code has been sent",
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            emailError: emailError.message,
            otpCode: otpCode
          }
        })
      });
    }
  } catch (err) {
    console.error('❌ Request password reset OTP error:', err);
    res.status(400).json({ 
      success: false,
      err: err.message,
      message: err.message
    });
  }
};

// OTP-based password reset - Step 2: Verify OTP and reset password
module.exports.resetPasswordWithOTP = async (req, res) => {
  console.log('🔐 [Auth] resetPasswordWithOTP function called');
  console.log('🔐 [Auth] Request body:', JSON.stringify(req.body));
  
  try {
    const { email, otpCode, newPassword } = req.body;
    
    console.log('🔍 [Auth] Email:', email);
    console.log('🔍 [Auth] OTP Code:', otpCode);
    console.log('🔍 [Auth] New Password Length:', newPassword?.length);
    
    if (!email || !otpCode || !newPassword) {
      throw new Error("Email, OTP code, and new password are required");
    }

    // Find user by email
    const User = require('../../../database/mongo/schemas/Users.schema');
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    console.log('🔍 [Auth] User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      throw new Error("Invalid or expired verification code");
    }

    console.log('🔍 [Auth] User OTP:', user.passwordResetOTP);
    console.log('🔍 [Auth] User OTP Expires:', user.passwordResetOTPExpires);
    console.log('🔍 [Auth] Provided OTP:', otpCode);
    
    // Check if OTP exists and hasn't expired
    if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
      console.error('❌ [Auth] No OTP found in database');
      throw new Error("No password reset request found. Please request a new code");
    }

    // Check if OTP has expired
    if (new Date() > user.passwordResetOTPExpires) {
      console.error('❌ [Auth] OTP has expired');
      // Clear expired OTP
      await User.findByIdAndUpdate(user._id, {
        passwordResetOTP: null,
        passwordResetOTPExpires: null
      });
      throw new Error("Verification code has expired. Please request a new code");
    }

    // Verify OTP code
    if (user.passwordResetOTP !== otpCode) {
      console.error('❌ [Auth] OTP mismatch');
      console.error('❌ [Auth] Expected:', user.passwordResetOTP);
      console.error('❌ [Auth] Received:', otpCode);
      throw new Error("Invalid verification code");
    }

    console.log('✅ [Auth] OTP verified successfully');

    // Validate password strength (optional but recommended)
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetOTP: null,
      passwordResetOTPExpires: null
    });

    console.log('✅ Password reset successful for:', email);

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password"
    });
  } catch (err) {
    console.error('❌ Reset password with OTP error:', err);
    res.status(400).json({ 
      success: false,
      err: err.message,
      message: err.message
    });
  }
};

// generate new token from refresh token
module.exports.generateTokenFromRefreshToken = async (req, res) => {
  try {
    const decodedToken = await authService.extractRefreshTokenDetails(
      req.body.jwtToken
    );

    if (!decodedToken.userId) {
      throw new Error("Invalid Refresh Token");
    }

    const userDetails = await userRepository.getUserDetailsByCriteria({
      _id: decodedToken.userId,
    });

    if (userDetails.length) {
      const { accessToken, refreshToken } = await authService.generateJwtToken({
        userId: userDetails[0]._id,
        email: userDetails[0].email.toLowerCase(),
        name: userDetails[0].name.toLowerCase(),
        accountType: userDetails[0].accountType.toLowerCase(),
      });

      res.json({ accessToken, refreshToken });
    } else {
      throw new Error("User Not Exists. Please login again.");
    }
  } catch (err) {
    console.error(err);
    res.json({ err: "Invalid Refresh Token." });
  }
};

// generate new token from refresh token
module.exports.checkIsAdmin = async (req, res) => {
  try {
    const userDetails = await userRepository.getUserDetailsByCriteria({
      email: req.body.email,
    });
    res.json({
      isAdmin:
        userDetails.length &&
          ["superadmin", "admin"].includes(userDetails[0]?.accountType)
          ? true
          : false,
    });
  } catch (err) {
    console.error(err);
    res.json({ err: "You're not admin" });
  }
};

// Add method to create admin user - Enhanced with email notification
module.exports.createAdminUser = async (req, res) => {
  try {
    console.log('🔍 Create Admin Request Body:', req.body);
    
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      console.log('❌ Validation failed - missing fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists with email:', email.toLowerCase());
    const existingUser = await userRepository.getUserDetailsByCriteria({
      email: email.toLowerCase(),
    });

    console.log('🔍 Existing user check result:', { found: existingUser.length > 0, count: existingUser.length });

    if (existingUser.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    console.log('🔍 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed successfully');

    // Create admin user object
    const adminUserData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      socialIdentityProvider: "", // Set to empty string for email login compatibility
      accountType: role, // Use role as accountType for consistency
      role: role, // Also set role field
      isEmailVerified: true, // Auto-verify admin users
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('🔍 Creating user with data:', {
      name: adminUserData.name,
      email: adminUserData.email,
      accountType: adminUserData.accountType,
      role: adminUserData.role,
      isEmailVerified: adminUserData.isEmailVerified,
      status: adminUserData.status
    });

    // Create the user
    const newUser = await userRepository.createUser(adminUserData);
    console.log('✅ User created with ID:', newUser._id);

    // Send welcome email to the new admin (non-blocking)
    try {
      const emailService = require("../../../common/services/email.service");
      if (emailService.isEmailServiceConfigured()) {
        await emailService.sendWelcomeEmail(email, name);
        console.log('✅ Welcome email sent to new admin');
      } else {
        console.log('⚠️ Email service not configured - welcome email not sent');
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError.message);
      // Don't fail the user creation if email fails
    }

    // Send notification to system admin (optional, non-blocking)
    try {
      const emailService = require("../../../common/services/email.service");
      if (emailService.isEmailServiceConfigured()) {
        await emailService.sendAdminCreatedNotification('admin@nexc.co.uk', {
          name,
          email,
          role
        });
        console.log('✅ Admin creation notification sent');
      }
    } catch (notificationError) {
      console.error('⚠️ Failed to send admin notification:', notificationError.message);
      // Don't fail the user creation if notification fails
    }

    console.log("✅ Admin user created successfully:", {
      id: newUser._id,
      email: newUser.email,
      role: newUser.accountType,
    });

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.accountType,
      },
    });
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create admin user: " + error.message,
    });
  }
};

// Add method to debug users (for development)
module.exports.debugUsers = async (req, res) => {
  try {
    // Only allow in development or for admins
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is only available in development",
      });
    }

    const users = await userRepository.getUserDetailsByCriteria({});

    // Remove sensitive data for debugging
    const sanitizedUsers = users.map((user) => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      accountType: user.accountType,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      password: user.password ? "Present" : "Missing",
      createdAt: user.createdAt,
    }));

    res.json({
      success: true,
      count: sanitizedUsers.length,
      users: sanitizedUsers,
    });
  } catch (error) {
    console.error("❌ Error in debug users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users: " + error.message,
    });
  }
};

// Add method to sync existing MongoDB users
module.exports.syncMongoUsers = async (req, res) => {
  try {
    console.log("🔄 Starting user sync process...");

    // Get all users from database
    const allUsers = await userRepository.getUserDetailsByCriteria({});
    console.log(`Found ${allUsers.length} users in database`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const user of allUsers) {
      try {
        // Ensure required fields are present
        const updates = {};

        // Set default accountType if missing
        if (!user.accountType) {
          updates.accountType = "user";
        }

        // Set role field to match accountType if missing
        if (!user.role) {
          updates.role = user.accountType || "user";
        }

        // Set email verification status if missing
        if (user.isEmailVerified === undefined) {
          updates.isEmailVerified = false;
        }

        // Set status if missing
        if (!user.status) {
          updates.status = "active";
        }

        // Update user if any changes needed
        if (Object.keys(updates).length > 0) {
          await userRepository.updateUser(
            { _id: user._id },
            { ...updates, updatedAt: new Date() },
            {}
          );
          syncedCount++;
          console.log(`✅ Synced user: ${user.email}`);
        }
      } catch (userError) {
        console.error(`❌ Error syncing user ${user.email}:`, userError);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `User sync completed. ${syncedCount} users updated, ${errorCount} errors.`,
      stats: {
        total: allUsers.length,
        synced: syncedCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("❌ Error in sync users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync users: " + error.message,
    });
  }
};
