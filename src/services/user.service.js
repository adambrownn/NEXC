import axiosInstance from "../axiosConfig";

class UserService {
    createUser(user) {
        localStorage.setItem("billinguser", JSON.stringify(user));
        return true;
    }

    getBillingUser() {
        try {
            return JSON.parse(localStorage.getItem("billinguser"));
        } catch (error) {
            console.error("Error parsing billing user data:", error);
            return null;
        }
    }

    // Add new profile management methods
    async getProfile() {
        try {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (!currentUser?.userId) return null;

            const response = await axiosInstance.get(`/user/profile/${currentUser.userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await axiosInstance.post('/user/update-profile', profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }

    async updateNotificationPreferences(preferences) {
        try {
            const response = await axiosInstance.put('/user/notification-preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }
}

const userService = new UserService();
export default userService;