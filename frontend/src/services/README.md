# 🔧 PocketBase Service

## Overview
The PocketBase service handles all API interactions with the PocketBase backend, providing a consistent interface for CRUD operations on quizzes, questions, users, and submissions.

## 🚨 ID Validation

### Problem
The original service was throwing "Missing required record id" errors when invalid IDs were passed to PocketBase methods. This happened because:
- `null` or `undefined` IDs were passed directly to PocketBase
- Empty strings or invalid values caused PocketBase to fail
- No validation was performed before making API calls

### Solution
Added comprehensive ID validation to all methods that require an ID parameter:

```javascript
// Helper function for consistent validation
_validateId(id, entityName = 'record') {
  if (!id || id === null || id === undefined || id === '') {
    console.warn(`⚠️ PocketBase: Invalid ${entityName} ID provided:`, id);
    return false;
  }
  return true;
}
```

### Protected Methods
All CRUD methods now validate IDs before making API calls:

- **Quiz Methods**: `getQuizById`, `getQuizQuestions`, `updateQuiz`, `deleteQuiz`
- **Question Methods**: `getQuestionById`, `updateQuestion`, `deleteQuestion`
- **User Methods**: `updateUser`, `deleteUser`, `resetUserPassword`, `getUserSubmissions`, `getAvailableQuizzes`
- **Submission Methods**: `submitQuiz`, `getSubmissionById`

## 🔍 Error Handling

### Error Format
All methods return a consistent error format:

```javascript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE"
}
```

### Error Codes
- `INVALID_QUIZ_ID` - Invalid quiz ID provided
- `INVALID_QUESTION_ID` - Invalid question ID provided
- `INVALID_USER_ID` - Invalid user ID provided
- `INVALID_SUBMISSION_ID` - Invalid submission ID provided
- `AUTH_REQUIRED` - User not authenticated
- `FETCH_QUIZ_FAILED` - Error fetching quiz data
- `FETCH_QUIZ_QUESTIONS_FAILED` - Error fetching quiz questions
- `CREATE_QUIZ_FAILED` - Error creating quiz
- `UPDATE_QUIZ_FAILED` - Error updating quiz
- `DELETE_QUIZ_FAILED` - Error deleting quiz
- `SUBMIT_QUIZ_FAILED` - Error submitting quiz
- `SUBMISSION_CREATION_FAILED` - Error creating submission record
- `CORRUPTED_SUBMISSION_DATA` - Submission data missing required fields

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run only PocketBase service tests
npm test -- pocketbase.test.js

# Run with coverage
npm test -- --coverage
```

### Test Coverage
The test suite covers:
- ✅ ID validation for all entity types
- ✅ Error handling and formatting
- ✅ All CRUD operations
- ✅ Edge cases (null, undefined, empty strings)

## 🐛 Debugging

### Common Issues

#### 1. "Missing required record id" Error
**Cause**: Invalid ID passed to PocketBase method
**Solution**: Check that the ID is valid before calling the method

#### 2. "TypeError: u.quiz.trim is not a function" Error
**Cause**: Quiz field is an object instead of string ID
**Solution**: Ensure quiz field is a string ID, not the entire quiz object

```javascript
// ❌ Wrong - sending quiz object
const payload = { quiz: quiz.value, ... }

// ✅ Correct - sending quiz ID string
const payload = { quiz: quiz.value.id, ... }
```

```javascript
// ❌ Wrong - may cause error
const result = await PocketBaseService.getQuizById(quizId);

// ✅ Correct - check ID first
if (quizId && quizId !== '') {
  const result = await PocketBaseService.getQuizById(quizId);
}
```

#### 2. Undefined Quiz ID
**Cause**: Component trying to load quiz before ID is available
**Solution**: Add loading state and wait for ID

```javascript
// ❌ Wrong - may call with undefined
onMounted(async () => {
  const quiz = await PocketBaseService.getQuizById(quizId); // quizId may be undefined
});

// ✅ Correct - wait for ID to be available
watch(() => quizId, async (newId) => {
  if (newId) {
    const quiz = await PocketBaseService.getQuizById(newId);
  }
});
```

#### 3. Route Parameter Issues
**Cause**: Route parameter not properly extracted
**Solution**: Validate route parameters

```javascript
// ❌ Wrong - assumes route param exists
const quizId = route.params.id;

// ✅ Correct - validate route param
const quizId = route.params.id;
if (!quizId) {
  console.error('No quiz ID in route params');
  return;
}
```

### Debug Logging
The service includes comprehensive logging:

```javascript
console.log('🔍 PocketBase: getQuizById called', { id, expand });
console.log('✅ PocketBase: Successfully fetched quiz by ID', result);
console.error('❌ PocketBase: getQuizById error:', error);
console.warn('⚠️ PocketBase: Invalid quiz ID provided:', id);
```

### Browser Console
Check the browser console for:
- 🔍 Method calls with parameters
- ✅ Successful operations
- ❌ Error details
- ⚠️ Validation warnings

## 📋 Best Practices

### 1. Always Validate IDs
```javascript
// Before calling any PocketBase method
if (!id || id === '') {
  console.warn('Invalid ID provided:', id);
  return;
}
```

### 2. Handle Errors Gracefully
```javascript
const result = await PocketBaseService.getQuizById(quizId);
if (!result.success) {
  console.error('Failed to fetch quiz:', result.error);
  // Show user-friendly error message
  return;
}
```

### 3. Use Loading States
```javascript
const loading = ref(false);
const quiz = ref(null);

const loadQuiz = async (id) => {
  loading.value = true;
  try {
    const result = await PocketBaseService.getQuizById(id);
    if (result.success) {
      quiz.value = result.data;
    }
  } finally {
    loading.value = false;
  }
};
```

### 4. Check Authentication
```javascript
// For methods that require authentication
if (!PocketBaseService.getCurrentUser()) {
  console.warn('User not authenticated');
  // Redirect to login or show auth required message
  return;
}
```

## 🔄 Migration Guide

### From Old Service
If you're migrating from the old service:

1. **Update Error Handling**: Check for `success` property in responses
2. **Add ID Validation**: Validate IDs before calling methods
3. **Handle New Error Codes**: Use specific error codes for better UX
4. **Update Logging**: Use new console log format for debugging

### Example Migration
```javascript
// ❌ Old way
try {
  const quiz = await PocketBaseService.getQuizById(quizId);
  // Use quiz directly
} catch (error) {
  console.error('Error:', error);
}

// ✅ New way
const result = await PocketBaseService.getQuizById(quizId);
if (result.success) {
  const quiz = result.data;
  // Use quiz
} else {
  console.error('Error:', result.error);
  // Handle specific error code
}
```

## 📚 API Reference

### Quiz Methods
- `getQuizById(id, expand = [])` - Fetch quiz by ID
- `getQuizQuestions(quizId)` - Fetch questions for a quiz
- `getAllQuizzes(includeInactive = false)` - Fetch all quizzes
- `createQuiz(quizData)` - Create new quiz
- `updateQuiz(id, quizData)` - Update existing quiz
- `deleteQuiz(id)` - Delete quiz

### Question Methods
- `getQuestionById(id)` - Fetch question by ID
- `getAllQuestions(filters = {})` - Fetch all questions
- `createQuestion(questionData)` - Create new question
- `updateQuestion(id, questionData)` - Update existing question
- `deleteQuestion(id)` - Delete question
- `searchQuestions(query, filters = {})` - Search questions

### User Methods
- `getCurrentUser()` - Get current authenticated user
- `updateUser(id, userData)` - Update user
- `deleteUser(id)` - Delete user
- `resetUserPassword(id, newPassword)` - Reset user password
- `getUserSubmissions(userId, limit = 10)` - Get user submissions
- `getAvailableQuizzes()` - Get all active quizzes available to authenticated users

### Submission Methods
- `submitQuiz(quizId, answers, timeTaken)` - Submit quiz answers
- `getSubmissionById(id)` - Get submission by ID
- `getAllSubmissions(filters = {})` - Get all submissions

### Authentication Methods
- `login(email, password)` - User login
- `logout()` - User logout
- `register(email, password, passwordConfirm, name)` - User registration
- `refreshAuth()` - Refresh authentication token
- `isAuthenticated()` - Check if user is authenticated
- `isAdmin()` - Check if user is admin

## 🚀 Performance Tips

1. **Use Caching**: Implement client-side caching for frequently accessed data
2. **Batch Operations**: Group multiple operations when possible
3. **Lazy Loading**: Load data only when needed
4. **Error Boundaries**: Implement error boundaries to prevent cascading failures
5. **Loading States**: Show loading indicators for better UX

## 🔐 Security Notes

- All ID validation happens client-side for UX purposes
- Server-side validation is still required for security
- Authentication is checked before sensitive operations
- User permissions are validated on the server
- Never trust client-side data for critical operations
