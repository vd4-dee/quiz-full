/**
 * 🧪 Test Submission Flow Utility
 * 
 * Tests the complete flow from quiz submission to results loading
 * to identify where quiz_id might be getting lost
 */

import PocketBaseService from './pocketbase.js';

// Test the complete submission flow
async function testSubmissionFlow() {
  console.log('🚀 Testing complete submission flow...');
  
  try {
    // Step 1: Test quiz submission
    console.log('\n📝 Step 1: Testing quiz submission...');
    const mockQuizId = 'test-quiz-123';
    const mockAnswers = { 'q1': 0, 'q2': 1, 'q3': 2 };
    const mockTimeTaken = 300; // 5 minutes
    
    const submissionResult = await PocketBaseService.submitQuiz(mockQuizId, mockAnswers, mockTimeTaken);
    
    if (submissionResult.success) {
      console.log('✅ Quiz submission successful:', {
        submissionId: submissionResult.data.id,
        quizId: submissionResult.data.quiz,
        userId: submissionResult.data.user
      });
      
      // Step 2: Test loading submission by ID
      console.log('\n🔍 Step 2: Testing submission loading...');
      const submissionData = await PocketBaseService.getSubmissionById(submissionResult.data.id);
      
      if (submissionData.success) {
        console.log('✅ Submission loaded successfully:', {
          id: submissionData.data.id,
          quiz_id: submissionData.data.quiz,
          user_id: submissionData.data.user,
          score: submissionData.data.score
        });
        
        // Step 3: Test loading quiz data using submission.quiz
        console.log('\n🔍 Step 3: Testing quiz data loading...');
        console.log('Quiz ID from submission:', submissionData.data.quiz);
        
        if (submissionData.data.quiz && submissionData.data.quiz.trim() !== '') {
          console.log('✅ Quiz ID is valid, attempting to load quiz...');
          
          // This would normally load the actual quiz, but we're just testing the flow
          console.log('✅ Quiz ID validation passed - ready to load quiz data');
        } else {
          console.error('❌ Quiz ID is missing or empty:', submissionData.data.quiz);
          console.error('❌ Full submission data:', submissionData.data);
        }
      } else {
        console.error('❌ Failed to load submission:', submissionData.error);
      }
    } else {
      console.error('❌ Quiz submission failed:', submissionResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test submission flow failed:', error);
  }
}

// Test submission validation
function testSubmissionValidation() {
  console.log('\n🧪 Testing submission validation...');
  
  // Test valid quiz IDs
  const validQuizIds = ['quiz-123', 'abc123', '123'];
  validQuizIds.forEach(id => {
    const result = PocketBaseService._validateId(id, 'quiz');
    console.log(`✅ Valid quiz ID "${id}":`, result);
  });
  
  // Test invalid quiz IDs
  const invalidQuizIds = [null, undefined, '', 0, false];
  invalidQuizIds.forEach(id => {
    const result = PocketBaseService._validateId(id, 'quiz');
    console.log(`❌ Invalid quiz ID "${id}":`, result);
  });
}

// Test error handling
function testErrorHandling() {
  console.log('\n🧪 Testing error handling...');
  
  // Test various error scenarios
  const testErrors = [
    { message: 'Test error message' },
    { data: { message: 'Nested error message' } },
    {}
  ];
  
  testErrors.forEach((error, index) => {
    const result = PocketBaseService._handleError(error, `TEST_ERROR_${index}`);
    console.log(`Error ${index + 1}:`, {
      success: result.success,
      error: result.error,
      code: result.code
    });
  });
}

// Run all tests
export async function runSubmissionFlowTests() {
  console.log('🧪 Running submission flow tests...');
  
  testSubmissionValidation();
  testErrorHandling();
  await testSubmissionFlow();
  
  console.log('\n🎉 All submission flow tests completed!');
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testSubmissionFlow = runSubmissionFlowTests;
  console.log('💡 Call window.testSubmissionFlow() to run submission flow tests');
}

export default {
  testSubmissionFlow,
  testSubmissionValidation,
  testErrorHandling,
  runSubmissionFlowTests
};
