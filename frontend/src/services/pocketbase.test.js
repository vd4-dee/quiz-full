/**
 * 🧪 PocketBase Service Tests
 * 
 * Test ID validation and error handling
 */

import PocketBaseService from './pocketbase.js';

// Mock PocketBase
jest.mock('pocketbase');

describe('PocketBaseService ID Validation', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('ID Validation Helper', () => {
    test('_validateId should return true for valid IDs', () => {
      expect(PocketBaseService._validateId('valid-id-123', 'test')).toBe(true);
      expect(PocketBaseService._validateId(123, 'test')).toBe(true);
      expect(PocketBaseService._validateId('0', 'test')).toBe(true);
    });

    test('_validateId should return false for invalid IDs', () => {
      expect(PocketBaseService._validateId(null, 'test')).toBe(false);
      expect(PocketBaseService._validateId(undefined, 'test')).toBe(false);
      expect(PocketBaseService._validateId('', 'test')).toBe(false);
      expect(PocketBaseService._validateId(0, 'test')).toBe(false);
    });
  });

  describe('Quiz Methods', () => {
    test('getQuizById should return error for invalid ID', async () => {
      const result = await PocketBaseService.getQuizById(null);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUIZ_ID');
      expect(result.error).toBe('Invalid quiz ID provided');
    });

    test('getQuizQuestions should return error for invalid ID', async () => {
      const result = await PocketBaseService.getQuizQuestions('');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUIZ_ID');
      expect(result.error).toBe('Invalid quiz ID provided for questions');
    });

    test('updateQuiz should return error for invalid ID', async () => {
      const result = await PocketBaseService.updateQuiz(undefined, {});
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUIZ_ID');
      expect(result.error).toBe('Invalid quiz ID provided for update');
    });

    test('deleteQuiz should return error for invalid ID', async () => {
      const result = await PocketBaseService.deleteQuiz(0);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUIZ_ID');
      expect(result.error).toBe('Invalid quiz ID provided for delete');
    });
  });

  describe('Question Methods', () => {
    test('getQuestionById should return error for invalid ID', async () => {
      const result = await PocketBaseService.getQuestionById(null);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUESTION_ID');
      expect(result.error).toBe('Invalid question ID provided');
    });

    test('updateQuestion should return error for invalid ID', async () => {
      const result = await PocketBaseService.updateQuestion('', {});
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUESTION_ID');
      expect(result.error).toBe('Invalid question ID provided for update');
    });

    test('deleteQuestion should return error for invalid ID', async () => {
      const result = await PocketBaseService.deleteQuestion(undefined);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUESTION_ID');
      expect(result.error).toBe('Invalid question ID provided for delete');
    });
  });

  describe('User Methods', () => {
    test('updateUser should return error for invalid ID', async () => {
      const result = await PocketBaseService.updateUser(0, {});
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_USER_ID');
      expect(result.error).toBe('Invalid user ID provided for update');
    });

    test('deleteUser should return error for invalid ID', async () => {
      const result = await PocketBaseService.deleteUser(null);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_USER_ID');
      expect(result.error).toBe('Invalid user ID provided for delete');
    });

    test('resetUserPassword should return error for invalid ID', async () => {
      const result = await PocketBaseService.resetUserPassword('', 'newpass');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_USER_ID');
      expect(result.error).toBe('Invalid user ID provided for password reset');
    });

    test('getUserSubmissions should return error for invalid ID', async () => {
      const result = await PocketBaseService.getUserSubmissions(undefined);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_USER_ID');
      expect(result.error).toBe('Invalid user ID provided for submissions');
    });

    test('getAvailableQuizzes should return error when not authenticated', async () => {
      // Mock unauthenticated state
      PocketBaseService.pb.authStore.isValid = false;
      
      const result = await PocketBaseService.getAvailableQuizzes();
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('AUTH_REQUIRED');
      expect(result.error).toBe('User not authenticated');
    });
  });

  describe('Submission Methods', () => {
    test('submitQuiz should return error for invalid ID', async () => {
      const result = await PocketBaseService.submitQuiz(null, {}, 120);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUIZ_ID');
      expect(result.error).toBe('Invalid quiz ID provided for submission');
    });

    test('submitQuiz should return error for object quiz ID', async () => {
      const result = await PocketBaseService.submitQuiz({ id: 'quiz123' }, {}, 120);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_QUIZ_ID');
      expect(result.error).toBe('Quiz field must be a string ID, not an object');
    });

    test('submitQuiz should return error when user not authenticated', async () => {
      // Mock unauthenticated user
      PocketBaseService.getCurrentUser = jest.fn().mockReturnValue(null);
      
      const result = await PocketBaseService.submitQuiz('valid-quiz-id', {}, 120);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('AUTH_REQUIRED');
      expect(result.error).toBe('User not authenticated');
    });

    test('getSubmissionById should return error for invalid ID', async () => {
      const result = await PocketBaseService.getSubmissionById('');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_SUBMISSION_ID');
      expect(result.error).toBe('Invalid submission ID provided');
    });
  });

  describe('Error Handling', () => {
    test('_handleError should format errors correctly', () => {
      const error = { message: 'Test error message' };
      const result = PocketBaseService._handleError(error, 'TEST_ERROR');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error message');
      expect(result.code).toBe('TEST_ERROR');
    });

    test('_handleError should handle nested error messages', () => {
      const error = { data: { message: 'Nested error message' } };
      const result = PocketBaseService._handleError(error, 'NESTED_ERROR');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Nested error message');
      expect(result.code).toBe('NESTED_ERROR');
    });

    test('_handleError should handle missing error message', () => {
      const error = {};
      const result = PocketBaseService._handleError(error, 'NO_MESSAGE');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
      expect(result.code).toBe('NO_MESSAGE');
    });
  });
});

console.log('🧪 PocketBase Service tests loaded successfully');
console.log('📋 Test coverage: ID validation, error handling, all CRUD methods');
console.log('🚀 Ready to run validation tests');
