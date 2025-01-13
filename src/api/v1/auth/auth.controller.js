const express = require("express");
const router = express();

const authService = require("./auth.service");

/**
 *
 * @param {loginType, email, password, phoneNumber, token, deviceToken} req
 * @param {user, accessToken, refreshToken} res
 * @returns
 */
router
  .route("/login")
  // user login
  .post(authService.authenticateUser);

router
  .route("/generate-new-token")
  .post(authService.generateTokenFromRefreshToken);

router.route("/reset-password").post(authService.resetPassword);

/**
 * check if a user is admin
 */
router.route("/is-admin").post(authService.checkIsAdmin);

module.exports = router;
