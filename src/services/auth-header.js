/**
 * Service for handling authentication headers.
 */
class AuthHeader {
  /**
   * Retrieves the authentication header token.
   * @returns {Object} An object containing the authorization token or an empty object.
   */
  getAuthHeaderToken() {
    try {
      const token = JSON.parse(localStorage.getItem("accessToken"));
      if (token) {
        return { authorizationToken: `Bearer ${token}` };
      }
    } catch (error) {
      console.error("Error retrieving auth header token:", error);
    }
    return {};
  }
}

const authHeader = new AuthHeader();
export default authHeader;