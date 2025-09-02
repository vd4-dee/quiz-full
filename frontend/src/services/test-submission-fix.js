/**
 * 🧪 Test Quiz Submission Fix Utility
 * 
 * Tests that the quiz submission now works correctly with proper parameters
 */

import PocketBaseService from './pocketbase.js';

// Test the fixed submission flow
async function testFixedSubmission() {
  console.log('🧪 Testing fixed quiz submission...');
  
  try {
    // Test 1: Valid string quiz ID
    console.log('\n📝 Test 1: Valid string quiz ID');
    const validQuizId = 'test-quiz-123';
    const mockAnswers = { 'q1': 0, 'q2': 1 };
    const mockTimeTaken = 120;
    
    const result1 = await PocketBaseService.submitQuiz(validQuizId, mockAnswers, mockTimeTaken);
    
    if (result1.success) {
      console.log('✅ Valid string quiz ID - submission successful');
    } else {
      console.log('❌ Valid string quiz ID - submission failed:', result1.error);
    }
    
    // Test 2: Object quiz ID (should fail with new validation)
    console.log('\n📝 Test 2: Object quiz ID (should fail)');
    const objectQuizId = { id: 'quiz123', title: 'Test Quiz' };
    
    const result2 = await PocketBaseService.submitQuiz(objectQuizId, mockAnswers, mockTimeTaken);
    
    if (!result2.success && result2.code === 'INVALID_QUIZ_ID') {
      console.log('✅ Object quiz ID - correctly rejected with type validation');
    } else {
      console.log('❌ Object quiz ID - should have been rejected');
    }
    
    // Test 3: Null quiz ID (should fail with existing validation)
    console.log('\n📝 Test 3: Null quiz ID (should fail)');
    const result3 = await PocketBaseService.submitQuiz(null, mockAnswers, mockTimeTaken);
    
    if (!result3.success && result3.code === 'INVALID_QUIZ_ID') {
      console.log('✅ Null quiz ID - correctly rejected');
    } else {
      console.log('❌ Null quiz ID - should have been rejected');
    }
    
    console.log('\n🎉 All submission tests completed!');
    
  } catch (error) {
    console.error('❌ Test submission fix failed:', error);
  }
}

// Test parameter validation
function testParameterValidation() {
  console.log('\n🧪 Testing parameter validation...');
  
  // Test _validateId helper
  const testCases = [
    { input: 'valid-id', expected: true, description: 'Valid string ID' },
    { input: null, expected: false, description: 'Null ID' },
    { input: undefined, expected: false, description: 'Undefined ID' },
    { input: '', expected: false, description: 'Empty string ID' },
    { input: 0, expected: false, description: 'Zero ID' },
    { input: { id: 'test' }, expected: false, description: 'Object ID' }
  ];
  
  testCases.forEach(testCase => {
    const result = PocketBaseService._validateId(testCase.input, 'test');
    const status = result === testCase.expected ? '✅' : '❌';
    console.log(`${status} ${testCase.description}: ${testCase.input} -> ${result}`);
  });
}

// Run all tests
export async function runSubmissionFixTests() {
  console.log('🚀 Running submission fix tests...');
  
  testParameterValidation();
  await testFixedSubmission();
  
  console.log('\n🎉 All submission fix tests completed!');
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testSubmissionFix = runSubmissionFixTests;
  console.log('💡 Call window.testSubmissionFix() to run submission fix tests');
}

export default {
  testFixedSubmission,
  testParameterValidation,
  runSubmissionFixTests
};
