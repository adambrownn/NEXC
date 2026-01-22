import axiosInstance from '../axiosConfig';

class UserService {
  // Get all users with filtering and pagination
  async getUsers(filters = {}) {
    try {
      const response = await axiosInstance.get('/v1/auth/debug-users', { params: filters });
      return response.data?.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user roles for the platform
  async getUserRoles() {
    // These roles match your Users.schema.js accountType enum
    return ['user', 'staff', 'supervisor', 'manager', 'admin', 'superadmin'];
  }

  // Update user role with audit trail
  async updateUserRole(userId, newRole, updatedBy) {
    try {
      const response = await axiosInstance.put(`/v1/user/${userId}/role`, {
        accountType: newRole, // Backend expects accountType
        role: newRole,
        updatedBy
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Create or update billing user
  async createUser(userData) {
    try {
      const response = await axiosInstance.post('/v1/user/billing', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user profile information
  async updateUserProfile(userId, profileData) {
    try {
      // Backend route is POST /v1/user/update-profile with extractTokenDetails
      // It gets userId from token, but we send it in body for admin override
      const response = await axiosInstance.post('/v1/user/update-profile', {
        userId,
        ...profileData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Change user password
  async changePassword(passwordData) {
    try {
      const response = await axiosInstance.put('/v1/user/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await axiosInstance.get(`/v1/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get saved billing user from localStorage
  async getBillingUser() {
    try {
      const saved = localStorage.getItem('billingUser');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error getting saved billing user:', error);
      return null;
    }
  }

  // Save billing user to localStorage
  async saveBillingUser(userData) {
    try {
      localStorage.setItem('billingUser', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Error saving billing user:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear saved billing user
  async clearBillingUser() {
    try {
      localStorage.removeItem('billingUser');
      return { success: true };
    } catch (error) {
      console.error('Error clearing billing user:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateUser(userId, userData) {
    try {
      const response = await axiosInstance.put(`/v1/user/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Search users by name, email, or phone
  async searchUsers(query) {
    try {
      const response = await axiosInstance.get(`/v1/users/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get user activity/audit log
  async getUserActivity(userId, limit = 10) {
    try {
      const response = await axiosInstance.get(`/v1/user/${userId}/activity`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return []; // Return empty array as fallback
    }
  }
}

// Fix: Export properly to avoid anonymous default export warning
const userService = new UserService();
export default userService;