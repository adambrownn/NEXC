import axiosInstance from "../axiosConfig";

class AuthService {
  async loginWithEmail(email, password) {
    // loginType, email, password, phoneNumber, token, deviceToken
    const response = await axiosInstance.post("/auth/login", {
      loginType: "email",
      email,
      password,
    });
    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem(
        "accessToken",
        JSON.stringify(response.data.accessToken)
      );
      localStorage.setItem(
        "refreshToken",
        JSON.stringify(response.data.refreshToken)
      );
    }
    return response.data;
  }

  async logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  async register(name, email, password, registrationType) {
    const response = await axiosInstance.post("/user/registration", {
      name,
      email,
      password,
      registrationType,
    });
    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem(
        "accessToken",
        JSON.stringify(response.data.accessToken)
      );
      localStorage.setItem(
        "refreshToken",
        JSON.stringify(response.data.refreshToken)
      );
    }
    return response.data;
  }

  async getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
