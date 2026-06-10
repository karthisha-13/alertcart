const cron = require('node-cron');
const Product = require('../models/Product');
const { scrapePrice } = require('./scraper');
const { sendPriceDropEmail } = require('./emailService');
const { sendPriceDropSMS } = require('./smsService');

/**
 * Check all products and send alerts if price drops below target
 */
const checkAllPrices = async () => {
  console.log(`\n⏰ [${new Date().toISOString()}] Starting price check for all products...`);

  let products;
  try {
    products = await Product.findAll();
  } catch (err) {
    console.error('❌ Failed to fetch products from DB:', err.message);
    return;
  }

  if (!products.length) {
    console.log('ℹ️  No products to check.');
    return;
  }

  console.log(`📦 Checking ${products.length} product(s)...`);

  for (const product of products) {
    try {
      console.log(`  🔍 Checking: ${product.name} (${product.platform})`);

      const { name: scrapedName, price: currentPrice } = await scrapePrice(product.productURL);

      // Update current price and last checked
      product.currentPrice = currentPrice;
      product.lastChecked = new Date();

      // Update name if blank
      if (!product.name || product.name === 'Unknown') {
        product.name = scrapedName;
      }

      console.log(`     Current Price: ₹${currentPrice} | Target: ₹${product.targetPrice}`);

      // Check if price dropped below target
      if (currentPrice <= product.targetPrice) {
        if (!product.notified) {
          console.log(`  🎉 PRICE DROP! Sending alert to ${product.userEmail}...`);
          const emailSent = await sendPriceDropEmail(product);
          
          let smsSent = false;
          if (product.userPhone) {
            console.log(`  📱 Sending SMS alert to ${product.userPhone}...`);
            smsSent = await sendPriceDropSMS(product);
          }
          
          if (emailSent || smsSent) {
            product.notified = true;
          }
        } else {
          console.log(`     Price remains below target, user already notified.`);
        }
      } else {
        // Reset notified flag if price rises above target again (so next drop triggers alert)
        if (product.notified && currentPrice > product.targetPrice) {
          product.notified = false;
        }
        console.log(`     No drop. Skipping.`);
      }

      await product.save();
    } catch (err) {
      console.error(`  ❌ Error checking ${product.name}: ${err.message}`);
      product.lastChecked = new Date();
      try { await product.save(); } catch (_) {}
    }
  }

  console.log('✅ Price check complete.\n');
};

/**
 * Start the cron scheduler
 */
const startPriceChecker = () => {
  const schedule = process.env.CRON_SCHEDULE || '0 */6 * * *';
  console.log(`🕐 Price checker scheduled: "${schedule}"`);

  cron.schedule(schedule, checkAllPrices);

  // Also run once at startup (after 10 seconds to let DB connect)
  setTimeout(() => {
    console.log('🚀 Running initial price check...');
    checkAllPrices();
  }, 10000);
};

module.exports = { startPriceChecker, checkAllPrices };
