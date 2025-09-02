// test-api-connection.js
// Test script to verify API connection from different hosts

const testApiConnection = async (baseUrl) => {
  console.log(`Testing API connection to: ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS: ${baseUrl} - ${data.message}`);
      return true;
    } else {
      console.log(`❌ FAILED: ${baseUrl} - HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${baseUrl} - ${error.message}`);
    return false;
  }
};

// Test different URLs
const testUrls = [
  'http://localhost:8090',
  'http://127.0.0.1:8090',
  'http://10.97.41.250:8090' // Your detected LAN IP
];

console.log('🔍 Testing API connections...\n');

testUrls.forEach(async (url) => {
  await testApiConnection(url);
});

console.log('\n📋 Instructions:');
console.log('1. If localhost works but LAN IP fails, check Windows Firewall');
console.log('2. If both fail, check if PocketBase is running');
console.log('3. Use the working URL in your frontend configuration');
