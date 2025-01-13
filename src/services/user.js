class UserService {
  async createUser(user) {
    localStorage.setItem("billinguser", JSON.stringify(user));
    return true;
  }

  async getBillingUser() {
    return JSON.parse(localStorage.getItem("billinguser"));
  }

  // token to track order status
  async createBucketToken(tokenPayload) {
    localStorage.setItem("buckettoken", JSON.stringify(tokenPayload));
    return true;
  }
  async getBucketToken() {
    return JSON.parse(localStorage.getItem("buckettoken"));
  }
}

export default new UserService();
