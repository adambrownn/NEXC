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

  // token to track order status
  createBucketToken(tokenPayload) {
    localStorage.setItem("buckettoken", JSON.stringify(tokenPayload));
    return true;
  }

  getBucketToken() {
    try {
      return JSON.parse(localStorage.getItem("buckettoken"));
    } catch (error) {
      console.error("Error parsing bucket token:", error);
      return null;
    }
  }
}

const userService = new UserService();
export default userService;