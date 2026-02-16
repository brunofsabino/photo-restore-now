/**
 * Test R2 Connection
 * Run: node test-r2.js
 */

const { S3Client, PutObjectCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

async function testR2() {
  console.log('🔍 Testing R2 Connection...\n');
  
  // Check env vars
  console.log('Environment Variables:');
  console.log('- R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
  console.log('- R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('- R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  console.log('- R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME || '❌ Missing');
  console.log('- R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL || '❌ Missing');
  console.log();

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Initialize client
  const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  console.log('📡 Endpoint:', endpoint);
  console.log();

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  // Test 1: List buckets
  console.log('📦 Test 1: Listing buckets...');
  try {
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    console.log('✅ Buckets found:', response.Buckets?.map(b => b.Name).join(', ') || 'none');
    
    const hasBucket = response.Buckets?.some(b => b.Name === process.env.R2_BUCKET_NAME);
    if (hasBucket) {
      console.log(`✅ Bucket "${process.env.R2_BUCKET_NAME}" exists`);
    } else {
      console.log(`⚠️  Bucket "${process.env.R2_BUCKET_NAME}" NOT found`);
    }
  } catch (error) {
    console.error('❌ Failed to list buckets:', error.message);
    console.error('Details:', error);
    return;
  }
  console.log();

  // Test 2: Upload small file
  console.log('📤 Test 2: Uploading test file...');
  try {
    const testData = Buffer.from('Hello from PhotoRestoreNow!');
    const key = 'test/test-upload.txt';
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: testData,
      ContentType: 'text/plain',
    });

    await client.send(command);
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    console.log('✅ Upload successful!');
    console.log('📎 URL:', publicUrl);
    console.log('🌐 Test in browser:', publicUrl);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.error('Error name:', error.name);
    console.error('Error code:', error.$metadata?.httpStatusCode);
    return;
  }
  console.log();

  console.log('✅ All tests passed! R2 is working correctly.');
}

testR2().catch(err => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
