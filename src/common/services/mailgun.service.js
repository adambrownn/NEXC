const mailgun = require("mailgun-js");

const DOMAIN = "ethicallearner.com";
const mg = mailgun({
  apiKey: "cfec2c8f561e9339ae1aa98c5c6adbe6 - c4d287b4 - bb28a58f",
  domain: DOMAIN,
});

//  ----------------- MAILGUN EMAIL VERIFICATION --------------------

/**
 * verify Verification Code via SMS
 * @param destinationEmail
 */
module.exports.sendVerificationCodeViaEmail = async (destinationEmail) => {
  try {
    const data = {
      from: "Ethical Learner <official@ethicallearner.com>",
      to: destinationEmail,
      subject: "Hello",
      text: "Testing some Mailgun awesomness!",
    };

    mg.messages().send(data, function (error, body) {
      console.log(error);
      console.log(body);
      return error ? error : body;
    });
  } catch (error) {
    return { err: "Unable to Send Message" };
  }
};

// /**
//  * verify Verification Code via SMS
//  * @param destinationEmail
//  * @param verificationCode
//  */
// module.exports.verifyCodeSentViaEmail = async (
//   destinationEmail,
//   verificationCode
// ) => {
//   try {
//     const check = await this.twilioClient.verify
//       .services(verifyServiceSID)
//       .verificationChecks.create({
//         to: `+91${verifyCodeSentViaSMSDto.phoneNumber}`,
//         code: verifyCodeSentViaSMSDto.verificationCode,
//       });
//     /**
//      * check.status > "approved"/"pending"/"canceled"
//      * approved > verified
//      * pending > incorrect
//      */
//     return check;
//   } catch (error) {
//     /**
//      * if (error.code === 20404)
//      * expired (10 minutes)
//      * already approved
//      * when the max attempts to check a code have been reached
//      */
//     this.logger.info(`Error verifying code: '${error}'`);
//     throw new BadRequestException("Unable to Verify Code");
//   }
// };

// -------------- TWILIO PHONE NUMBER VERIFICATION -----------------------

// module.exports.sendVerificationCodeViaEmail = (destinationEmail) => {
//   const verifyServiceSID = process.env.TWILIO_VERIFY_SERVICE_SID;

//   try {
//     const verification = await twilioClient.verify
//       .services(verifyServiceSID)
//       .verifications.create({
//         to: `+91${sendVerificationCodeDto.phoneNumber}`,
//         channel: "sms",
//         locale: "en",
//         // customMessage: "write_custom_message_here",
//       });
//     return verification;
//   } catch (error) {
//     return { err: "Unable to Send verification OTP" };
//   }
// };

// /**
//  * verify Verification Code via SMS
//  * @param destinationEmail
//  * @param verificationCode
//  */
// module.exports.verifyCodeSentViaEmail = (
//   destinationEmail,
//   verificationCode
// ) => {
//   const verifyServiceSID =
//     this.configService.twilioCredentials.TWILIO_VERIFY_SERVICE_SID;
//   try {
//     const check = await this.twilioClient.verify
//       .services(verifyServiceSID)
//       .verificationChecks.create({
//         to: `+91${verifyCodeSentViaSMSDto.phoneNumber}`,
//         code: verifyCodeSentViaSMSDto.verificationCode,
//       });
//     /**
//      * check.status > "approved"/"pending"/"canceled"
//      * approved > verified
//      * pending > incorrect
//      */
//     return check;
//   } catch (error) {
//     /**
//      * if (error.code === 20404)
//      * expired (10 minutes)
//      * already approved
//      * when the max attempts to check a code have been reached
//      */
//     this.logger.info(`Error verifying code: '${error}'`);
//     throw new BadRequestException("Unable to Verify Code");
//   }
// };
