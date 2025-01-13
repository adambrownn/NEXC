class AuthHeader {
  async getAuthHeaderToken() {
    const token = await JSON.parse(localStorage.getItem("accessToken"));
    if (token) {
      return { authorizationToken: "Bearer " + token };
    } else {
      return {};
    }
  }
}

export default new AuthHeader();
