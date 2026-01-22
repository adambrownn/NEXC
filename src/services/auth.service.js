import axiosInstance from "../axiosConfig";

class AuthService {
  async loginWithEmail(email, password) {
    try {
      const response = await axiosInstance.post("/auth/login", {
        loginType: "email",
        email,
        password,
      });
      if (response.data.accessToken) {
        this.setUserData(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      return {
        err: error.response?.data?.message || "Failed to login with email"
      };
    }
  }

  // Add new method for phone login
  async loginWithPhone(phone, password) {
    try {
      const response = await axiosInstance.post("/auth/login", {
        loginType: "phone",
        phone,
        password,
      });
      if (response.data.accessToken) {
        this.setUserData(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("Phone login error:", error);
      return {
        err: error.response?.data?.message || "Failed to login with phone",
      };
    }
  }

  async logout() {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token"); // Also remove the new token format
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async register(name, identifier, password, registrationType) {
    try {
      // Construct request body based on registration type
      const requestBody = {
        name,
        password,
        registrationType
      };

      // Add the appropriate identifier based on registration type
      if (registrationType === "email") {
        requestBody.email = identifier;
      } else if (registrationType === "phone") {
        requestBody.phoneNumber = identifier;
      }

      const response = await axiosInstance.post("/user/registration", requestBody);
      if (response.data.accessToken) {
        this.setUserData(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        err: error.response?.data?.message || "Registration failed"
      };
    }
  }

  async verifyCodeEmail(email, code) {
    try {
      const response = await axiosInstance.post("/user/verify-code-email", {
        email,
        code
      });
      return response.data;
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        err: error.response?.data?.message || "Failed to verify code"
      };
    }
  }

  async verifyCodePhone(phone, code) {
    try {
      const response = await axiosInstance.post("/user/verify-code-phone", {
        phone,
        code
      });
      return response.data;
    } catch (error) {
      console.error("Phone verification error:", error);
      return {
        err: error.response?.data?.message || "Failed to verify code"
      };
    }
  }

  async resendVerificationCode(type, identifier) {
    try {
      const endpoint = type === "email"
        ? "/user/send-verification-code-email"
        : "/user/send-verification-code-phone";

      const payload = type === "email"
        ? { email: identifier }
        : { destinationPhone: identifier };

      const response = await axiosInstance.post(endpoint, payload);
      return response.data;
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        err: error.response?.data?.message || "Failed to resend verification code"
      };
    }
  }

  // Add the missing resetPassword method
  async resetPassword(email) {
    try {
      console.log('🔑 Requesting password reset for:', email);
      
      const response = await axiosInstance.post('/auth/reset-password', {
        email: email.toLowerCase().trim()
      });

      console.log('✅ Password reset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return {
        err: error.response?.data?.message || error.response?.data?.err || "Failed to reset password"
      };
    }
  }

  // OTP-based password reset - Step 1: Request OTP
  async requestPasswordResetOTP(email) {
    try {
      console.log('🔑 Requesting password reset OTP for:', email);
      
      const response = await axiosInstance.post('/auth/reset-password-otp/request', {
        email: email.toLowerCase().trim()
      });

      console.log('✅ Password reset OTP request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Password reset OTP request error:', error);
      throw error;
    }
  }

  // OTP-based password reset - Step 2: Verify OTP and reset password
  async resetPasswordWithOTP(email, otpCode, newPassword) {
    try {
      console.log('🔑 Verifying OTP and resetting password for:', email);
      
      const response = await axiosInstance.post('/auth/reset-password-otp/verify', {
        email: email.toLowerCase().trim(),
        otpCode: otpCode.trim(),
        newPassword
      });

      console.log('✅ Password reset with OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Password reset with OTP error:', error);
      throw error;
    }
  }

  // Add method to confirm password reset with token
  async confirmPasswordReset(token, newPassword) {
    try {
      console.log('🔑 Confirming password reset with token');
      
      const response = await axiosInstance.post('/auth/confirm-password-reset', {
        token,
        password: newPassword
      });

      console.log('✅ Password reset confirmed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Password reset confirmation error:', error);
      return {
        err: error.response?.data?.message || error.response?.data?.err || "Failed to confirm password reset"
      };
    }
  }

  getCurrentUser() {
    try {
      // Try new format first, then fall back to old format
      const newFormatUser = localStorage.getItem("user");
      if (newFormatUser) {
        return JSON.parse(newFormatUser);
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  setUserData(data) {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("accessToken", JSON.stringify(data.accessToken));
    localStorage.setItem("refreshToken", JSON.stringify(data.refreshToken));
  }

  // Enhanced login method for admin users
  async login(email, password) {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await axiosInstance.post('/auth/login', {
        loginType: "email", // Add loginType for consistency
        email: email.toLowerCase().trim(),
        password
      });

      console.log('🔍 Login response:', response.data);

      // Handle both old and new response formats
      if (response.data.success || response.data.accessToken) {
        const userData = response.data.user || response.data;
        const token = response.data.token || response.data.accessToken;
        
        // Enhanced user object with role information
        const enhancedUser = {
          ...userData,
          id: userData._id || userData.userId || userData.id,
          userId: userData._id || userData.userId || userData.id,
          displayName: userData.name || userData.firstName + ' ' + userData.lastName || userData.email,
          role: userData.role || userData.accountType || 'user',
          email: userData.email,
          photoURL: userData.profileImage || userData.avatar,
          company: userData.company || userData.companyName,
          accountType: userData.accountType || userData.role || 'user'
        };

        console.log('✅ Enhanced user object:', enhancedUser);

        // Store in localStorage (both formats for compatibility)
        if (response.data.success) {
          // New format
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(enhancedUser));
        } else {
          // Old format
          this.setUserData({
            user: enhancedUser,
            accessToken: token,
            refreshToken: response.data.refreshToken
          });
        }
        
        // Set axios default header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { user: enhancedUser, token, success: true };
      } else {
        throw new Error(response.data.message || response.data.err || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Clear any stored data on error
      this.logout();
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.err ||
        error.message || 
        'Login failed. Please check your credentials.'
      );
    }
  }

  // Add method to create admin user if needed
  async createAdminUser(userData) {
    try {
      console.log('👑 Creating admin user:', userData);
      
      const response = await axiosInstance.post('/auth/create-admin', userData);
      
      if (response.data.success) {
        console.log('✅ Admin user created successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create admin user');
      }
    } catch (error) {
      console.error('❌ Admin creation error:', error);
      throw error;
    }
  }

  // Add method to sync MongoDB users
  async syncMongoUsers() {
    try {
      console.log('🔄 Syncing MongoDB users...');
      
      const response = await axiosInstance.post('/auth/sync-users');
      
      if (response.data.success) {
        console.log('✅ Users synced successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to sync users');
      }
    } catch (error) {
      console.error('❌ User sync error:', error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;