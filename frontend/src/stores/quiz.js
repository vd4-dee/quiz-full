// src/stores/quiz.js
import { defineStore } from 'pinia';
import PocketBaseService from '../services/pocketbase';

/**
 * Quiz Store: Handles quiz taking state and actions
 */
export const useQuizStore = defineStore('quiz', {
  state: () => ({
    // Quiz taking state
    currentQuiz: null,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    timeRemaining: 0,
    quizStartTime: null,
    isSubmitting: false,
    flaggedQuestions: [],
    
    // Quiz fetching state
    availableQuizzes: [],
    userSubmissions: [],
    loading: false,
    error: null,
    debugInfo: {}
  }),
  getters: {
    progressPercentage(state) {
      if (!state.questions.length) return 0;
      return Math.round((Object.keys(state.userAnswers).length / state.questions.length) * 100);
    },
    answeredCount(state) {
      return Object.keys(state.userAnswers).length;
    },
    remainingTime(state) {
      const min = Math.floor(state.timeRemaining / 60);
      const sec = state.timeRemaining % 60;
      return `${min}:${sec.toString().padStart(2, '0')}`;
    },
    canSubmit(state) {
      return state.questions.length > 0 && Object.keys(state.userAnswers).length === state.questions.length;
    },
  },
  actions: {
    // Quiz taking actions
    startQuiz(quiz) {
      this.currentQuiz = quiz;
      this.questions = quiz.questions || [];
      this.currentQuestionIndex = 0;
      this.userAnswers = {};
      this.timeRemaining = quiz.duration_minutes * 60;
      this.quizStartTime = Date.now();
      this.isSubmitting = false;
      this.flaggedQuestions = [];
      sessionStorage.setItem('quiz_progress', JSON.stringify(this.$state));
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    saveAnswer(questionId, answer) {
      this.userAnswers[questionId] = answer;
      sessionStorage.setItem('quiz_progress', JSON.stringify(this.$state));
    },
    flagQuestion(questionId) {
      if (!this.flaggedQuestions.includes(questionId)) {
        this.flaggedQuestions.push(questionId);
      }
    },
    async submitQuiz(quizId, answers, timeTaken) {
      try {
        console.log('🔍 Submitting quiz:', { quizId, answers, timeTaken });
        const result = await PocketBaseService.submitQuiz(quizId, answers, timeTaken);
        
        if (result.success) {
          console.log('✅ Quiz submitted successfully:', result.data);
          this.isSubmitting = false;
          sessionStorage.removeItem('quiz_progress');
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Error submitting quiz:', error);
        this.error = error.message;
        this.isSubmitting = false;
        throw error;
      }
    },
    pauseQuiz() {
      // Optionally implement pause logic
    },
    resumeQuiz() {
      // Optionally implement resume logic
    },

    // Quiz fetching actions
    async loadAvailableQuizzes() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔍 Loading available quizzes...');
        const startTime = Date.now();
        
        const result = await PocketBaseService.getAvailableQuizzes();
        
        if (result.success) {
          this.availableQuizzes = result.data;
          const endTime = Date.now();
          
          this.debugInfo = {
            loadTime: endTime - startTime,
            count: result.data.length,
            lastFetch: new Date().toISOString(),
            success: true
          };
          
          console.log('✅ Quizzes loaded successfully:', result.data);
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Error loading quizzes:', error);
        this.error = error.message;
        this.debugInfo = {
          loadTime: 0,
          count: 0,
          lastFetch: new Date().toISOString(),
          success: false,
          error: error.message
        };
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getAllQuizzes(includeInactive = false) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔍 Loading all quizzes...', { includeInactive });
        const startTime = Date.now();
        
        const result = await PocketBaseService.getAllQuizzes(includeInactive);
        
        if (result.success) {
          const endTime = Date.now();
          
          this.debugInfo = {
            loadTime: endTime - startTime,
            count: result.data.length,
            lastFetch: new Date().toISOString(),
            success: true
          };
          
          console.log('✅ All quizzes loaded successfully:', result.data);
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Error loading all quizzes:', error);
        this.error = error.message;
        this.debugInfo = {
          loadTime: 0,
          count: 0,
          lastFetch: new Date().toISOString(),
          success: false,
          error: error.message
        };
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getUserSubmissions(userId) {
      try {
        console.log('🔍 Loading user submissions for:', userId);
        const result = await PocketBaseService.getUserSubmissions(userId);
        
        if (result.success) {
          this.userSubmissions = result.data;
          console.log('✅ User submissions loaded:', result.data);
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Error loading user submissions:', error);
        this.error = error.message;
        throw error;
      }
    },

    async getQuizById(id, expand = []) {
      try {
        console.log('🔍 Loading quiz by ID:', id, { expand });
        const result = await PocketBaseService.getQuizById(id, expand);
        
        if (result.success) {
          console.log('✅ Quiz loaded successfully:', result.data);
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Error loading quiz by ID:', error);
        this.error = error.message;
        throw error;
      }
    },

    async getQuizQuestions(quizId) {
      try {
        console.log('🔍 Loading quiz questions for quiz ID:', quizId);
        const result = await PocketBaseService.getQuizQuestions(quizId);
        
        if (result.success) {
          console.log('✅ Quiz questions loaded successfully:', result.data);
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Error loading quiz questions:', error);
        this.error = error.message;
        throw error;
      }
    },

    async getSubmissionById(id) {
      try {
        console.log('🔍 Loading submission by ID:', id);
        const result = await PocketBaseService.getSubmissionById(id);
        
        if (result.success) {
          console.log('✅ Submission loaded successfully:', result.data);
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Error loading submission by ID:', error);
        this.error = error.message;
        throw error;
      }
    },

    // Debug and utility methods
    clearError() {
      this.error = null;
    },

    getDebugInfo() {
      return this.debugInfo;
    }
  },
});