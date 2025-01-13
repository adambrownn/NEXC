const express = require("express");
const userService = require("./user.service");
const uploadFileService = require("../../../common/services/upload-file.service");
const {
  sendVerificationCodeViaEmail,
  verifyCodeSentViaEmail,
} = require("../../../common/services/mailgun.service");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const { sendSMS } = require("../../../common/services/twilio.service");
const router = express();

router
  .route("/")
  /**
   *
   * @param {accountType || userId} req
   * @param {users} res
   * @returns
   */
  .get(userService.getUsers);

router
  .route("/:userId")
  /**
   *
   * @param { userId} req
   * @param {users} res
   * @returns
   */
  .delete(extractTokenDetails, userService.deleteUserByUserId);

router
  .route("/profile")
  /**
   *
   * @param {userId} req
   * @param {user} res
   * @returns
   */
  .post(userService.getUserDetails);
/**
 *
 * @param {email, password, phoneNumber, address, name, accountType, registrationType} req
 * @param {user, accessToken, refreshToken} res
 * @returns
 */
router.route("/registration").post(userService.registerUser);

/**
 *
 * @param  {name} req
 * @param {user} res
 * @returns
 */
router
  .route("/update-profile")
  .post(extractTokenDetails, userService.updateUserProfile);

/**
 * @param {File, fileCategory}
 */
router
  .route("/upload-media")
  .post(extractTokenDetails, uploadFileService.uploadFile);

// change role aka Account Type of a user
router
  .route("/update-user-account-type-details")
  .put(extractTokenDetails, userService.updateUserAccountTypeDetails);

/**
 * API to send OTP via simple Message
 * TWILIO
 */
router.route("/send-otp-via-simple-message").post(async (req, res) => {
  try {
    // send 6 digit Verification Code via SMS
    const randomOtp = Math.floor(100000 + Math.random() * 900000);
    const otpMessage = `${randomOtp} is your Construction Safety Line verification code. Enjoy!`;

    const messageResp = sendSMS(req.body.destinationPhone, otpMessage);
    res.json({
      message: messageResp,
      verificationCode: randomOtp,
    });
  } catch (error) {
    console.log(error);
    res.json({ err: "Unable to Send verification OTP" });
  }
});

/**
 * API to send Verification code via EMail
 */
router.route("/send-verification-code-email").post(async (req, res) => {
  const verificationRes = sendVerificationCodeViaEmail(req.body.email);
  res.json(verificationRes);
});

/**
 * API to verify Verification code via Email
 */
router.route("/verify-code-email").post(async (req, res) => {
  return verifyCodeSentViaEmail(req.body.email, req.body.code);
});

/**
 *
 * @param  {phoneNumber, messageBody} req
 * @param {SMSRes} res
 * @returns
 */

router.route("/send-sms").post(async (req, res) => {
  try {
    const smsRes = await sendSMS(req.body.phoneNumber, req.body.messageBody);
    res.json(smsRes);
  } catch (error) {
    console.log(error);
    res.json({ err: "Unable to Send SMS" });
  }
});

module.exports = router;
