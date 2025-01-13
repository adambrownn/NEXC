const axios = require("axios");

module.exports.payOnSagePay = async (cardInfo, price, billingInfo) => {
  try {
    // credential buffer
    const credentials = Buffer.from(
      `${process.env.INTEGRATION_KEY}:${process.env.INTEGRATION_PASSWORD}`
    ).toString("base64");
    let config = {
      headers: { Authorization: `Basic ${credentials}` },
    };
    let data = {};
    // create merchant sessoin errCode|401
    let request = await axios.post(
      "https://pi-live.sagepay.com/api/v1/merchant-session-keys",
      { vendorName: process.env.VENDOR_NAME },
      config
    );
    if (request.status) {
      data = request.data;
    }
    const merchantHeader = {
      headers: { Authorization: `Bearer ${data.merchantSessionKey}` },
    };
    let cardIdentifier = await axios.post(
      `https://pi-live.sagepay.com/api/v1/card-identifiers`,
      {
        cardDetails: {
          cardholderName: cardInfo.cardholderName,
          cardNumber: cardInfo.cardNumber,
          expiryDate: cardInfo.expiryDate,
          securityCode: cardInfo.securityCode,
        },
      },
      merchantHeader
    );
    const objectTransaction = {
      transactionType: "Payment",
      paymentMethod: {
        card: {
          merchantSessionKey: `${data.merchantSessionKey}`,
          cardIdentifier: cardIdentifier.data.cardIdentifier,
        },
      },
      vendorTxCode: `${Math.floor(Math.random() * 10000000000000)}`,
      amount: price * 100,
      currency: "GBP",
      description: billingInfo.description,
      apply3DSecure: "UseMSPSetting",
      customerFirstName: billingInfo.customerFirstName,
      customerLastName: billingInfo.customerLastName,
      billingAddress: {
        address1: billingInfo.address,
        city: billingInfo.city,
        postalCode: billingInfo.postalCode,
        country: "GB",
      },
      entryMethod: "Ecommerce",
    };
    // initiate payment now
    let transaction = await axios.post(
      "https://pi-live.sagepay.com/api/v1/transactions",
      objectTransaction,
      config
    );

    return transaction.data;
  } catch (error) {
    return { err: error };
  }
};
