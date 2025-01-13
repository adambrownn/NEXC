import axios from "axios";
import AuthHeader from "./services/auth-header";
import authService from "./services/auth.service";

const axiosInstance = axios.create({
  // baseURL: "http://localhost:8080/v1",
  baseURL: "https://constructionsafetyline.co.uk/v1",
});

(async () => {
  const headerAccessToken = await AuthHeader.getAuthHeaderToken();
  axiosInstance.defaults.headers.common["authorization"] =
    headerAccessToken.authorizationToken;
  axiosInstance.defaults.headers.post["Content-Type"] = "application/json";

  axiosInstance.interceptors.request.use(
    (request) => {
      // console.log("axios request");
      // console.log(request);
      // Edit request config
      return request;
    },
    (error) => {
      // console.log(error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      // console.log("axios response");
      // console.log(response);
      if (
        ["JWT expired.", "Auth token missing", "Invalid Token."].includes(
          response.data.err
        )
      ) {
        authService.logout();
        window.location.replace("/aut/login");
      }
      // Edit response config
      return response;
    },
    (error) => {
      // console.log(error);
      if (error.message === "Network Error") {
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
})();

export default axiosInstance;
