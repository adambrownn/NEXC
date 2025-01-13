const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const verifyServiceSID = process.env.TWILIO_VERIFY_SERVICE_SID;

module.exports.sendVerificationCodeViaSMS = async (destinationPhone) => {
  const verification = await client.verify
    .services(verifyServiceSID)
    .verifications.create({
      to: `+91${destinationPhone}`,
      channel: "sms",
      locale: "en",
      // customMessage: "write_custom_message_here",
    });
  return verification;
};

module.exports.verifyCodeSentViaSMS = async (
  destinationPhone,
  verificationCode
) => {
  const check = await client.verify
    .services(verifyServiceSID)
    .verificationChecks.create({
      to: `+91${destinationPhone}`,
      code: verificationCode,
    });
  return check;
};

module.exports.sendSMS = async (destinationPhone, messageBody) => {
  const messageResp = await client.messages.create({
    body: messageBody,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${destinationPhone}`,
  });
  return messageResp;
};
