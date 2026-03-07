/**
 * Simulate Stripe payment_intent.succeeded webhook
 * Triggers complete restoration flow: Order → Job → Processing → Email
 * 
 * Usage:
 *   node simulate-webhook.js <payment_intent_id>
 * 
 * Example:
 *   node simulate-webhook.js pi_3StYQYEOiSg0hBbQ1DG2VP8y
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function simulateWebhook(paymentIntentId, fileKeys, email = 'test@photorestorenow.com') {
  console.log('🔔 Simulating Stripe Webhook: payment_intent.succeeded\n');
  
  console.log('📋 Payload Details:');
  console.log('   Payment Intent ID:', paymentIntentId);
  console.log('   Email:', email);
  console.log('   File Keys:', fileKeys);
  console.log('   Base URL:', BASE_URL);
  console.log();

  // Build webhook payload matching Stripe's structure
  const webhookPayload = {
    id: `evt_test_${Date.now()}`,
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: paymentIntentId,
        metadata: {
          email,
          packageId: '1-photo',
          imageCount: fileKeys.length.toString(),
          fileKeys: fileKeys.join(','),
        },
        amount: 599,
        status: 'succeeded',
      },
    },
  };

  try {
    console.log('📤 Sending webhook to:', `${BASE_URL}/api/webhooks/stripe`);
    console.log('   Note: This bypasses Stripe signature verification in TEST_MODE');
    console.log();

    const response = await axios.post(
      `${BASE_URL}/api/webhooks/stripe`,
      webhookPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'test_signature_bypass',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Webhook processed successfully!');
    console.log('   Status:', response.status);
    if (response.data) {
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
    console.log();
    console.log('📊 What happened:');
    console.log('   1. ✅ Order created in database');
    console.log('   2. ✅ Job created with file keys');
    console.log('   3. ✅ Async restoration started');
    console.log('   4. ⏳ Processing images with AI provider');
    console.log();
    console.log('💡 Check logs above for job processing details');
    console.log('💡 Check email for completion notification');
    console.log();
    console.log('🔍 Database check:');
    console.log('   npx prisma studio');
    
  } catch (error) {
    console.error('❌ Webhook failed:', error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status) {
      console.error('   Status:', error.response.status);
    }
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Missing arguments');
    console.log();
    console.log('Usage:');
    console.log('   node simulate-webhook.js <fileKey1> [fileKey2] [fileKey3] ...');
    console.log();
    console.log('Example:');
    console.log('   node simulate-webhook.js original/abc123.jpg original/def456.jpg');
    console.log();
    console.log('💡 First run test-e2e-flow.js to upload files and get their keys');
    console.log('   node test-e2e-flow.js');
    process.exit(1);
  }

  const fileKeys = args;
  const paymentIntentId = `pi_test_${Date.now()}`;

  await simulateWebhook(paymentIntentId, fileKeys);
}

main();
