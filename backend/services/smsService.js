const twilio = require('twilio');

/**
 * Send price drop alert SMS to user's mobile number
 */
const sendPriceDropSMS = async (product) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const { name, productURL, currentPrice, userPhone, platform } = product;

  if (!userPhone) return false;

  const platformName = platform === 'amazon' ? 'Amazon' : platform === 'flipkart' ? 'Flipkart' : 'Store';
  const isPlaceholder =
    !accountSid ||
    accountSid.includes('your_twilio_account_sid') ||
    !authToken ||
    authToken.includes('your_twilio_auth_token') ||
    !fromNumber ||
    fromNumber.includes('your_twilio_purchased_phone_number');

  const shortName = name && name.length > 25 ? name.substring(0, 22) + '...' : (name || 'Product');
  let cleanURL = productURL || '';
  if (platform === 'amazon' && cleanURL.includes('?')) {
    cleanURL = cleanURL.split('?')[0];
  }
  const messageBody = `🎉 Price Drop! "${shortName}" is ₹${currentPrice}. Buy: ${cleanURL}`;

  if (isPlaceholder) {
    console.log(`\nℹ️  [SMS Simulation] Twilio credentials not configured (placeholder credentials detected in .env).`);
    console.log(`📱 SMS would be sent to: ${userPhone}`);
    console.log(`💬 Message: ${messageBody}`);
    console.log(`----------------------------------------------------------------------\n`);
    return true;
  }

  try {
    const client = twilio(accountSid, authToken);
    const messageOpts = {
      body: messageBody,
      to: userPhone,
    };
    if (fromNumber.startsWith('MG')) {
      messageOpts.messagingServiceSid = fromNumber;
    } else {
      messageOpts.from = fromNumber;
    }
    const message = await client.messages.create(messageOpts);
    console.log(`📱 SMS sent to ${userPhone} | Message SID: ${message.sid}`);
    return true;
  } catch (err) {
    console.error(`❌ SMS failed for ${userPhone}:`, err.message);
    return false;
  }
};

module.exports = { sendPriceDropSMS };
