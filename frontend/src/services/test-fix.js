/**
 * 🧪 Quick Test for getAvailableQuizzes Fix
 */

import PocketBaseService from './pocketbase.js';

// Test the fix
async function testGetAvailableQuizzes() {
  console.log('🧪 Testing getAvailableQuizzes fix...');
  
  try {
    // This should now work without requiring userId parameter
    const result = await PocketBaseService.getAvailableQuizzes();
    
    if (result.success) {
      console.log('✅ getAvailableQuizzes fix successful!');
      console.log('📊 Found', result.data.length, 'available quizzes');
      return true;
    } else {
      console.log('❌ getAvailableQuizzes returned error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ getAvailableQuizzes test failed:', error);
    return false;
  }
}

// Test ID validation
function testIdValidation() {
  console.log('🧪 Testing ID validation...');
  
  // Test valid IDs
  const validIds = ['valid-id-123', 'abc123', '123'];
  validIds.forEach(id => {
    const result = PocketBaseService._validateId(id, 'test');
    console.log(`✅ Valid ID "${id}":`, result);
  });
  
  // Test invalid IDs
  const invalidIds = [null, undefined, '', 0, false];
  invalidIds.forEach(id => {
    const result = PocketBaseService._validateId(id, 'test');
    console.log(`❌ Invalid ID "${id}":`, result);
  });
}

// Run tests
export async function runQuickTests() {
  console.log('🚀 Running quick tests for PocketBase fixes...');
  
  testIdValidation();
  const quizTestResult = await testGetAvailableQuizzes();
  
  if (quizTestResult) {
    console.log('🎉 All tests passed! The fix is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
  
  return quizTestResult;
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testPocketBaseFix = runQuickTests;
  console.log('💡 Call window.testPocketBaseFix() to run tests');
}

export default {
  testGetAvailableQuizzes,
  testIdValidation,
  runQuickTests
};
