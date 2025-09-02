// src/stores/admin.js
import { defineStore } from 'pinia';
import PocketBaseService from '../services/pocketbase';

/**
 * Admin Store: Handles admin data and dashboard state
 */
export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    questions: [],
    quizzes: [],
    submissions: [],
    statistics: {},
    loading: { users: false, questions: false, quizzes: false },
  }),
  actions: {
    async resetUserPassword(id, newPassword) {
      const res = await PocketBaseService.resetUserPassword(id, newPassword);
      return res;
    },
    async loadUsers() {
      this.loading.users = true;
      const res = await PocketBaseService.getAllUsers();
      if (res.success) this.users = res.data;
      this.loading.users = false;
    },
    async createUser(userData) {
      const res = await PocketBaseService.createUser(userData);
      if (res.success) await this.loadUsers();
      return res;
    },
    async updateUser(id, userData) {
      const res = await PocketBaseService.updateUser(id, userData);
      if (res.success) await this.loadUsers();
      return res;
    },
    async deleteUser(id) {
      const res = await PocketBaseService.deleteUser(id);
      if (res.success) await this.loadUsers();
      return res;
    },
    async loadQuestions(filters = {}) {
      this.loading.questions = true;
      const res = await PocketBaseService.getAllQuestions(filters);
      if (res.success) this.questions = res.data;
      this.loading.questions = false;
    },
    async loadQuizzes() {
      this.loading.quizzes = true;
      const res = await PocketBaseService.getAllQuizzes(true);
      if (res.success) this.quizzes = res.data;
      this.loading.quizzes = false;
    },
    async loadSubmissions(filters = {}) {
      const res = await PocketBaseService.getAllSubmissions(filters);
      if (res.success) this.submissions = res.data;
    },
    async refreshStatistics() {
      // Placeholder for dashboard stats logic
      this.statistics = {};
    },
  },
});
