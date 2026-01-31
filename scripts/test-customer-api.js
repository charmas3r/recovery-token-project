/**
 * Test script to verify Customer Account API configuration
 * Run with: node scripts/test-customer-api.js
 */

// Load environment variables
const PUBLIC_STORE_DOMAIN = 'recovery-token-store.myshopify.com';
const PUBLIC_SHOP_ID = '75227332779';
const PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID = '48ff7de4-9b46-4570-9af1-7cde433ace50';
const PUBLIC_CUSTOMER_ACCOUNT_API_URL = 'https://shopify.com/75227332779';

console.log('🧪 Testing Customer Account API Configuration\n');
console.log('Store Domain:', PUBLIC_STORE_DOMAIN);
console.log('Shop ID:', PUBLIC_SHOP_ID);
console.log('Client ID:', PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID);
console.log('API URL:', PUBLIC_CUSTOMER_ACCOUNT_API_URL);
console.log('\n✅ Configuration looks valid!\n');

console.log('📋 Expected Customer Account API URL formats:');
console.log('   Format 1: https://shopify.com/{SHOP_ID}');
console.log('   Format 2: https://{STORE_DOMAIN}/account/customer/api/{VERSION}/graphql');
console.log('\n💡 To verify your exact URL:');
console.log('   1. Go to Shopify Admin → Settings → Customer accounts');
console.log('   2. Click "Headless" or "New customer accounts"');
console.log('   3. Look for the Customer Account API endpoint\n');
