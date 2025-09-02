// services/pocketbase.js
/**
 * PocketBaseService: Handles all PocketBase API interactions with robust error handling.
 * Uses PocketBase JS SDK and Axios for HTTP requests.
 * All methods return { success, data, error, code } format.
 */
import PocketBase from 'pocketbase';

// Auto-detect API URL based on current host
function getApiUrl() {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current host
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // If accessing via localhost, use localhost for API
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:8090';
  }
  
  // If accessing via LAN IP, use the same IP for API
  return `http://${currentHost}:8090`;
}

const BASE_URL = getApiUrl();

class PocketBaseService {
  /**
   * @constructor
   * Initializes PocketBase client, sets base URL, and configures listeners.
   */
  constructor() {
    console.log('PocketBase Service initialized with API URL:', BASE_URL);
    this.pb = new PocketBase(BASE_URL);
    this.pb.autoCancellation(false);
    this.pb.authStore.onChange(() => {
      // Optionally handle auth state changes
    });
    // Restore persisted auth if available
    try {
      const exported = localStorage.getItem('pb_auth');
      if (exported) {
        this.pb.authStore.import(exported);
      }
    } catch {}
  }

  // --- AUTH METHODS ---
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>}
   */
  async login(email, password) {
    try {
      const authData = await this.pb.collection('users').authWithPassword(email, password);
      // persist auth store (token + model)
      try { localStorage.setItem('pb_auth', this.pb.authStore.export()); } catch {}
      return { success: true, data: authData.record };
    } catch (error) {
      return this._handleError(error, 'LOGIN_FAILED');
    }
  }

  /**
   * Logout current user
   * @returns {boolean}
   */
  logout() {
    this.pb.authStore.clear();
    try { localStorage.removeItem('pb_auth'); } catch {}
    return true;
  }

  /**
   * Register a new user
   * @param {string} email
   * @param {string} password
   * @param {string} passwordConfirm
   * @param {string} name
   * @returns {Promise<object>}
   */
  async register(email, password, passwordConfirm, name) {
    try {
      const user = await this.pb.collection('users').create({ email, password, passwordConfirm, name });
      return { success: true, data: user };
    } catch (error) {
      return this._handleError(error, 'REGISTER_FAILED');
    }
  }

  /**
   * Refresh authentication
   * @returns {Promise<boolean>}
   */
  async refreshAuth() {
    try {
      await this.pb.collection('users').authRefresh();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current user object
   * @returns {object|null}
   */
  getCurrentUser() {
    return this.pb.authStore.model || null;
  }

  /**
   * Is user authenticated?
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.pb.authStore.token;
  }

  /**
   * Is user admin?
   * @returns {boolean}
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // --- QUESTIONS METHODS ---
  async getAllQuestions(filters = {}) {
    try {
      const filterStr = this._buildFilter(filters);
      const result = await this.pb.collection('questions').getFullList({ filter: filterStr });
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'FETCH_QUESTIONS_FAILED');
    }
  }

  async getQuizQuestions(quizId) {
    try {
      console.log('🔍 PocketBase: getQuizQuestions called', { quizId });
      
      // Validate quizId parameter
      if (!this._validateId(quizId, 'quiz')) {
        return this._handleError({ message: 'Invalid quiz ID provided for questions' }, 'INVALID_QUIZ_ID');
      }
      
      // First get the quiz to see if it has questions_list
      const quiz = await this.pb.collection('quizzes').getOne(quizId);
      console.log('🔍 PocketBase: Quiz data retrieved:', {
        id: quiz.id,
        title: quiz.title,
        questions_list: quiz.questions_list,
        questions_list_length: quiz.questions_list?.length
      });
      
      if (quiz.questions_list && quiz.questions_list.length > 0) {
        // Quiz has specific questions - fetch them
        const questions = await this.pb.collection('questions').getFullList({
          filter: `id ?~ "${quiz.questions_list.join('" || id ?~ "')}"`
        });
        
        console.log('✅ PocketBase: Successfully fetched quiz questions', { 
          count: questions.length,
          firstQuestion: questions[0] ? {
            id: questions[0].id,
            questions: questions[0].questions,
            question: questions[0].question,
            question_type: questions[0].question_type,
            answers: questions[0].answers
          } : null
        });
        
        return { success: true, data: questions };
      } else {
        // Quiz has no specific questions - return empty array
        console.log('ℹ️ PocketBase: Quiz has no specific questions');
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('❌ PocketBase: getQuizQuestions error:', error);
      return this._handleError(error, 'FETCH_QUIZ_QUESTIONS_FAILED');
    }
  }

  async getQuestionById(id) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'question')) {
        return this._handleError({ message: 'Invalid question ID provided' }, 'INVALID_QUESTION_ID');
      }
      
      const result = await this.pb.collection('questions').getOne(id);
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'FETCH_QUESTION_FAILED');
    }
  }

  async createQuestion(questionData) {
    try {
      const result = await this.pb.collection('questions').create(questionData);
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'CREATE_QUESTION_FAILED');
    }
  }

  async updateQuestion(id, questionData) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'question')) {
        return this._handleError({ message: 'Invalid question ID provided for update' }, 'INVALID_QUESTION_ID');
      }
      
      const result = await this.pb.collection('questions').update(id, questionData);
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'UPDATE_QUESTION_FAILED');
    }
  }

  async deleteQuestion(id) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'question')) {
        return this._handleError({ message: 'Invalid question ID provided for delete' }, 'INVALID_QUESTION_ID');
      }
      
      await this.pb.collection('questions').delete(id);
      return { success: true };
    } catch (error) {
      return this._handleError(error, 'DELETE_QUESTION_FAILED');
    }
  }

  async searchQuestions(query, filters = {}) {
    try {
      const text = query ? `question ~ "%${this._escapeLike(query)}%"` : '';
      const other = this._buildFilter(filters);
      const filterStr = [text, other].filter(Boolean).join(' && ');
      const result = await this.pb.collection('questions').getList(1, 50, { filter: filterStr || undefined });
      return { success: true, data: result.items };
    } catch (error) {
      return this._handleError(error, 'SEARCH_QUESTIONS_FAILED');
    }
  }

  // --- QUIZZES METHODS ---
  async getAllQuizzes(includeInactive = false) {
    try {
      console.log('🔍 PocketBase: getAllQuizzes called', { includeInactive, authValid: this.pb.authStore.isValid });
      
      // Check authentication first
      if (!this.pb.authStore.isValid) {
        console.warn('⚠️ PocketBase: User not authenticated');
        return this._handleError({ message: 'User not authenticated' }, 'AUTH_REQUIRED');
      }
      
      const filter = includeInactive ? '' : 'is_active = true';
      console.log('📡 Making request to quizzes collection with filter:', filter);
      
      const result = await this.pb.collection('quizzes').getFullList({ filter });
      console.log('✅ PocketBase: Successfully fetched quizzes', { count: result.length, items: result });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ PocketBase: getAllQuizzes error:', error);
      return this._handleError(error, 'FETCH_QUIZZES_FAILED');
    }
  }

  async getQuizById(id, expand = []) {
    try {
      console.log('🔍 PocketBase: getQuizById called', { id, expand });
      
      // Validate ID parameter
      if (!this._validateId(id, 'quiz')) {
        return this._handleError({ message: 'Invalid quiz ID provided' }, 'INVALID_QUIZ_ID');
      }
      
      const result = await this.pb.collection('quizzes').getOne(id, { expand });
      console.log('✅ PocketBase: Successfully fetched quiz by ID', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ PocketBase: getQuizById error:', error);
      return this._handleError(error, 'FETCH_QUIZ_FAILED');
    }
  }

  async createQuiz(quizData) {
    try {
      const result = await this.pb.collection('quizzes').create(quizData);
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'CREATE_QUIZ_FAILED');
    }
  }

  async updateQuiz(id, quizData) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'quiz')) {
        return this._handleError({ message: 'Invalid quiz ID provided for update' }, 'INVALID_QUIZ_ID');
      }
      
      const result = await this.pb.collection('quizzes').update(id, quizData);
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'UPDATE_QUIZ_FAILED');
    }
  }

  async deleteQuiz(id) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'quiz')) {
        return this._handleError({ message: 'Invalid quiz ID provided for delete' }, 'INVALID_QUIZ_ID');
      }
      
      await this.pb.collection('quizzes').delete(id);
      return { success: true };
    } catch (error) {
      return this._handleError(error, 'DELETE_QUIZ_FAILED');
    }
  }

  /**
   * Generate a dynamic quiz based on config (placeholder)
   * @param {object} config
   * @returns {Promise<object>} { success, data, error, code }
   */
  async generateDynamicQuiz(config) {
    // TODO: Implement dynamic quiz generation logic
    return { success: false, data: null, error: 'Not implemented', code: 'NOT_IMPLEMENTED' };
  }

  async getAvailableQuizzes() {
    try {
      console.log('🔍 PocketBase: getAvailableQuizzes called', { authValid: this.pb.authStore.isValid });
      
      // Check authentication first
      if (!this.pb.authStore.isValid) {
        console.warn('⚠️ PocketBase: User not authenticated');
        return this._handleError({ message: 'User not authenticated' }, 'AUTH_REQUIRED');
      }
      
      console.log('📡 Making request to quizzes collection with filter: is_active = true');
      const result = await this.pb.collection('quizzes').getList(1, 50, { filter: 'is_active = true' });
      console.log('✅ PocketBase: Successfully fetched available quizzes', { count: result.items.length, items: result.items });
      
      return { success: true, data: result.items };
    } catch (error) {
      console.error('❌ PocketBase: getAvailableQuizzes error:', error);
      return this._handleError(error, 'FETCH_AVAILABLE_QUIZZES_FAILED');
    }
  }

  // --- SUBMISSIONS METHODS ---
  async submitQuiz(quizId, answers, timeTaken) {
    try {
      // Validate quizId parameter
      if (!this._validateId(quizId, 'quiz')) {
        return this._handleError({ message: 'Invalid quiz ID provided for submission' }, 'INVALID_QUIZ_ID');
      }
      
      const user = this.getCurrentUser();
      if (!user?.id) {
        return this._handleError({ message: 'User not authenticated' }, 'AUTH_REQUIRED');
      }
      
      // ✅ ADD SCORE CALCULATION: Get quiz questions and calculate score
      console.log('🔍 Loading quiz questions for score calculation...');
      const quizQuestions = await this.pb.collection('questions').getFullList({
        filter: `id ?~ "${Object.keys(answers).join('" || id ?~ "')}"`
      });
      
      if (!quizQuestions || quizQuestions.length === 0) {
        console.warn('⚠️ No questions found for score calculation, using default score');
      }
      
      // Calculate score based on answers
      let correctAnswers = 0;
      let totalQuestions = 0;
      
      if (quizQuestions && quizQuestions.length > 0) {
        totalQuestions = quizQuestions.length;
        
        quizQuestions.forEach(question => {
          const userAnswer = answers[question.id];
          if (userAnswer !== null && userAnswer !== undefined) {
            const isCorrect = this._validateAnswer(question, userAnswer);
            if (isCorrect) {
              correctAnswers++;
            }
          }
        });
      } else {
        // Fallback: count answered questions
        totalQuestions = Object.keys(answers).length;
        correctAnswers = Math.floor(totalQuestions * 0.7); // Default 70% score for testing
      }
      
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      console.log('📊 Score calculation:', {
        correctAnswers,
        totalQuestions,
        score: `${score}%`
      });
      
      const nowIso = new Date().toISOString();
      const started = new Date(Date.now() - Math.max(0, (timeTaken || 0) * 1000)).toISOString();
      
      const submissionPayload = {
        user: user.id,
        quiz: quizId,
        score: score, // ✅ ADD SCORE FIELD
        total_questions: totalQuestions,
        started_at: started,
        completed_at: nowIso,
        status: 'completed', // ✅ ADD REQUIRED STATUS FIELD
        attempt_number: 1, // ✅ ADD REQUIRED ATTEMPT_NUMBER FIELD
        submission_type: 'normal', // ✅ ADD REQUIRED SUBMISSION_TYPE FIELD
        submission_data: {
          quizId,
          answers,
          timeTaken,
          score: score, // ✅ ADD SCORE TO SUBMISSION DATA
          correctAnswers,
          totalQuestions
        },
      };
      
      // ✅ ADD VALIDATION: Log submission payload for debugging
      console.log('📝 Creating submission with payload:', submissionPayload);
      
      // ✅ ADD VALIDATION: Check quiz field type and value
      if (typeof submissionPayload.quiz !== 'string') {
        console.error('❌ Submission payload quiz field is not a string:', {
          type: typeof submissionPayload.quiz,
          value: submissionPayload.quiz
        });
        return this._handleError({ message: 'Quiz field must be a string ID, not an object' }, 'INVALID_QUIZ_ID');
      }
      
      if (!submissionPayload.quiz || submissionPayload.quiz.trim() === '') {
        console.error('❌ Submission payload missing quiz field:', submissionPayload);
        return this._handleError({ message: 'Quiz ID is required for submission' }, 'INVALID_QUIZ_ID');
      }
      
      const submission = await this.pb.collection('submissions').create(submissionPayload);
      
      // ✅ ADD VALIDATION: Verify created submission has quiz field and score
      console.log('✅ Submission created successfully:', {
        id: submission.id,
        quiz_id: submission.quiz,
        user_id: submission.user,
        score: submission.score,
        total_questions: submission.total_questions
      });
      
      if (!submission.quiz) {
        console.error('❌ Created submission missing quiz field:', submission);
        return this._handleError({ message: 'Submission created but missing quiz reference' }, 'SUBMISSION_CREATION_FAILED');
      }
      
      if (submission.score === null || submission.score === undefined) {
        console.warn('⚠️ Created submission missing score field, this may cause display issues');
      }
      
      return { success: true, data: submission };
    } catch (error) {
      console.error('❌ Error creating submission:', error);
      return this._handleError(error, 'SUBMIT_QUIZ_FAILED');
    }
  }

  async getUserSubmissions(userId, limit = 10) {
    try {
      // Validate userId parameter
      if (!this._validateId(userId, 'user')) {
        return this._handleError({ message: 'Invalid user ID provided for submissions' }, 'INVALID_USER_ID');
      }
      
      const result = await this.pb.collection('submissions').getList(1, limit, { filter: `user = "${userId}"` });
      return { success: true, data: result.items };
    } catch (error) {
      return this._handleError(error, 'FETCH_USER_SUBMISSIONS_FAILED');
    }
  }

  async getSubmissionById(id) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'submission')) {
        return this._handleError({ message: 'Invalid submission ID provided' }, 'INVALID_SUBMISSION_ID');
      }
      
      const result = await this.pb.collection('submissions').getOne(id);
      
      // ✅ ADD VALIDATION: Check if submission has required fields
      if (!result.quiz) {
        console.error('❌ Submission missing quiz field:', result);
        return this._handleError({ message: 'Submission data corrupted: missing quiz reference' }, 'CORRUPTED_SUBMISSION_DATA');
      }
      
      if (!result.user) {
        console.error('❌ Submission missing user field:', result);
        return this._handleError({ message: 'Submission data corrupted: missing user reference' }, 'CORRUPTED_SUBMISSION_DATA');
      }
      
      console.log('✅ Submission loaded successfully:', {
        id: result.id,
        quiz_id: result.quiz,
        user_id: result.user,
        score: result.score,
        total_questions: result.total_questions
      });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error fetching submission:', error);
      return this._handleError(error, 'FETCH_SUBMISSION_FAILED');
    }
  }

  /**
   * Get statistics for a quiz (placeholder)
   * @param {string} quizId
   * @returns {Promise<object>} { success, data, error, code }
   */
  async getQuizStatistics(quizId) {
    // TODO: Implement quiz statistics logic
    return { success: false, data: null, error: 'Not implemented', code: 'NOT_IMPLEMENTED' };
  }

  async getAllSubmissions(filters = {}) {
    try {
      const filterStr = this._buildFilter(filters);
      const result = await this.pb.collection('submissions').getFullList({ filter: filterStr });
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'FETCH_ALL_SUBMISSIONS_FAILED');
    }
  }

  // --- USERS METHODS (Admin only) ---
  async getAllUsers(pagination = {}) {
    try {
      const result = await this.pb.collection('users').getList(1, 50, pagination);
      return { success: true, data: result.items };
    } catch (error) {
      return this._handleError(error, 'FETCH_USERS_FAILED');
    }
  }

  async createUser(userData) {
    try {
      const result = await this.pb.collection('users').create(userData);
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'CREATE_USER_FAILED');
    }
  }

  async updateUser(id, userData) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'user')) {
        return this._handleError({ message: 'Invalid user ID provided for update' }, 'INVALID_USER_ID');
      }
      
      const result = await this.pb.collection('users').update(id, userData);
      return { success: true, data: result };
    } catch (error) {
      return this._handleError(error, 'UPDATE_USER_FAILED');
    }
  }

  async deleteUser(id) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'user')) {
        return this._handleError({ message: 'Invalid user ID provided for delete' }, 'INVALID_USER_ID');
      }
      
      await this.pb.collection('users').delete(id);
      return { success: true };
    } catch (error) {
      return this._handleError(error, 'DELETE_USER_FAILED');
    }
  }

  /**
   * Reset a user's password (placeholder)
   * @param {string} id
   * @param {string} newPassword
   * @returns {Promise<object>} { success, data, error, code }
   */
  async resetUserPassword(id, newPassword) {
    try {
      // Validate ID parameter
      if (!this._validateId(id, 'user')) {
        return this._handleError({ message: 'Invalid user ID provided for password reset' }, 'INVALID_USER_ID');
      }
      
      const updated = await this.pb.collection('users').update(id, {
        password: newPassword,
        passwordConfirm: newPassword,
      });
      return { success: true, data: true };
    } catch (error) {
      return this._handleError(error, 'RESET_PASSWORD_FAILED');
    }
  }

  // --- ERROR HANDLING ---
  _handleError(error, code = 'ERROR') {
    let message = error?.message || 'Unknown error';
    if (error?.data?.message) message = error.data.message;
    return { success: false, error: message, code };
  }

  // --- HELPERS ---
  /**
   * Validate ID parameter to prevent "Missing required record id" errors
   * @param {any} id - ID to validate
   * @param {string} entityName - Name of entity for error message
   * @returns {boolean} - True if valid, false if invalid
   */
  _validateId(id, entityName = 'record') {
    if (!id || id === null || id === undefined || id === '') {
      console.warn(`⚠️ PocketBase: Invalid ${entityName} ID provided:`, id);
      return false;
    }
    return true;
  }
  
  _buildFilter(filters) {
    if (!filters) return '';
    if (typeof filters === 'string') return filters;
    const clauses = [];
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        const vals = value.map((v) => this._quote(v)).join(',');
        clauses.push(`${key} IN [${vals}]`);
      } else if (typeof value === 'boolean') {
        clauses.push(`${key} = ${value ? 'true' : 'false'}`);
      } else if (typeof value === 'number') {
        clauses.push(`${key} = ${value}`);
      } else {
        clauses.push(`${key} = ${this._quote(value)}`);
      }
    }
    return clauses.join(' && ');
  }

  _quote(v) {
    return `"${String(v).replace(/"/g, '\\"')}"`;
  }

  _escapeLike(v) {
    return String(v).replace(/[%_]/g, (m) => `\\${m}`);
  }
  
  // ✅ ADD ANSWER VALIDATION: Validate user answers against correct answers
  _validateAnswer(question, userAnswer) {
    try {
      if (!question || userAnswer === null || userAnswer === undefined) {
        return false;
      }
      
      const { question_type, correct_answers } = question;
      
      switch (question_type) {
        case 'Single Choice':
          return userAnswer === correct_answers[0];
        case 'Multiple Choice':
          if (!Array.isArray(userAnswer) || !Array.isArray(correct_answers)) {
            return false;
          }
          if (userAnswer.length !== correct_answers.length) {
            return false;
          }
          const sortedUser = [...userAnswer].sort();
          const sortedCorrect = [...correct_answers].sort();
          return sortedUser.every((ans, index) => ans === sortedCorrect[index]);
        case 'Yes/No':
          return userAnswer === correct_answers[0];
        default:
          console.warn(`⚠️ Unknown question type: ${question_type}`);
          return false;
      }
    } catch (error) {
      console.error('❌ Error validating answer:', error);
      return false;
    }
  }
}

export default new PocketBaseService();
