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

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("user"));
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
}

const authService = new AuthService();
export default authService;