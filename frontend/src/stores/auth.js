// src/stores/auth.js
import { defineStore } from 'pinia';
import PocketBaseService from '../services/pocketbase';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role
 */

/**
 * Auth Store: Handles authentication state and actions with enhanced role-based navigation
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    currentRole: null, // 'student' | 'teacher' | 'admin'
    activeInterface: null, // 'user' | 'admin' - tracks current interface for teachers
    interfaceHistory: [], // navigation history for back button
    loading: false,
    error: null,
  }),
  getters: {
    userDisplayName(state) {
      return state.user?.name || state.user?.email || '';
    },
    hasAdminAccess(state) {
      return !!state.user && (state.user.role === 'admin' || state.user.role === 'teacher');
    },
    canAccessAdmin(state) {
      return !!state.user && (state.user.role === 'admin' || state.user.role === 'teacher');
    },
    canAccessUser(state) {
      return !!state.user; // all roles can access user interface
    },
    availableInterfaces(state) {
      if (!state.user) return [];
      if (state.user.role === 'admin') return ['admin'];
      if (state.user.role === 'teacher') return ['user', 'admin'];
      if (state.user.role === 'student') return ['user'];
      return [];
    },
    shouldShowRoleSelection(state) {
      return state.user?.role === 'teacher' && state.availableInterfaces.length > 1;
    },
    currentInterfaceName(state) {
      if (state.activeInterface === 'admin') return 'Admin Dashboard';
      if (state.activeInterface === 'user') return 'Student Dashboard';
      return 'Dashboard';
    },
    isTeacher(state) {
      return state.user?.role === 'teacher';
    },
    isAdmin(state) {
      return state.user?.role === 'admin';
    },
    isStudent(state) {
      return state.user?.role === 'student';
    }
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      const res = await PocketBaseService.login(email, password);
      if (res.success) {
        this.user = res.data;
        this.isAuthenticated = true;
        this.currentRole = res.data.role;
        
        // Set initial interface based on role
        this.setInitialInterface();
        
        try { 
          localStorage.setItem('auth_user', JSON.stringify(this.user));
          localStorage.setItem('active_interface', this.activeInterface);
        } catch {}
      } else {
        this.error = res.error;
        this.isAuthenticated = false;
        this.user = null;
        this.currentRole = null;
        this.activeInterface = null;
      }
      this.loading = false;
      return res;
    },
    
    logout() {
      PocketBaseService.logout();
      this.user = null;
      this.isAuthenticated = false;
      this.currentRole = null;
      this.activeInterface = null;
      this.interfaceHistory = [];
      this.error = null;
      try { 
        localStorage.removeItem('auth_user');
        localStorage.removeItem('active_interface');
      } catch {}
    },
    
    checkAuth() {
      const user = PocketBaseService.getCurrentUser();
      if (user) {
        this.user = user;
        this.isAuthenticated = true;
        this.currentRole = user.role;
        this.activeInterface = localStorage.getItem('active_interface') || this.getDefaultInterface();
      } else {
        this.user = null;
        this.isAuthenticated = false;
        this.currentRole = null;
        this.activeInterface = null;
        this.interfaceHistory = [];
      }
    },
    
    async updateProfile(userData) {
      if (!this.user) return;
      this.loading = true;
      const res = await PocketBaseService.updateUser(this.user.id, userData);
      if (res.success) {
        this.user = res.data;
        this.currentRole = res.data.role;
        try { 
          localStorage.setItem('auth_user', JSON.stringify(this.user));
        } catch {}
      } else {
        this.error = res.error;
      }
      this.loading = false;
      return res;
    },
    
    initFromStorage() {
      try {
        const raw = localStorage.getItem('auth_user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.id) {
            this.user = u;
            this.isAuthenticated = !!PocketBaseService.isAuthenticated();
            this.currentRole = u.role;
            this.activeInterface = localStorage.getItem('active_interface') || this.getDefaultInterface();
          }
        }
      } catch {}
    },
    
    // NEW ACTIONS FOR TEACHER ROLE NAVIGATION
    
    checkUserRole() {
      if (!this.user) return null;
      return this.user.role;
    },
    
    switchInterface(targetInterface) {
      if (!this.canAccessAdmin && targetInterface === 'admin') {
        throw new Error('Access denied: Admin interface not available');
      }
      
      if (!this.canAccessUser && targetInterface === 'user') {
        throw new Error('Access denied: User interface not available');
      }
      
      // Save current context before switching
      this.preserveNavigationContext();
      
      // Switch interface
      this.activeInterface = targetInterface;
      
      // Save preference
      try {
        localStorage.setItem('active_interface', targetInterface);
      } catch {}
      
      return targetInterface;
    },
    
    getInitialRoute() {
      if (!this.user) return '/login';
      
      if (this.user.role === 'student') {
        return '/user/dashboard';
      } else if (this.user.role === 'teacher') {
        return '/role-selection';
      } else if (this.user.role === 'admin') {
        return '/admin/dashboard';
      }
      
      return '/user/dashboard';
    },
    
    validateInterfaceAccess(targetInterface) {
      if (!this.user) return false;
      
      if (targetInterface === 'admin') {
        return this.canAccessAdmin;
      } else if (targetInterface === 'user') {
        return this.canAccessUser;
      }
      
      return false;
    },
    
    updateInterfaceHistory(route) {
      if (!this.activeInterface) return;
      
      const historyKey = `interface_history_${this.activeInterface}`;
      let history = this.interfaceHistory[historyKey] || [];
      
      // Add current route to history
      history.push({
        path: route.path,
        name: route.name,
        timestamp: Date.now()
      });
      
      // Keep only last 10 entries
      if (history.length > 10) {
        history = history.slice(-10);
      }
      
      this.interfaceHistory[historyKey] = history;
    },
    
    preserveNavigationContext() {
      // Save current interface state
      const context = {
        interface: this.activeInterface,
        timestamp: Date.now(),
        // Add more context data as needed
      };
      
      try {
        localStorage.setItem('navigation_context', JSON.stringify(context));
      } catch {}
    },
    
    restoreNavigationContext() {
      try {
        const context = localStorage.getItem('navigation_context');
        if (context) {
          const parsed = JSON.parse(context);
          // Restore context if it's recent (within 1 hour)
          if (Date.now() - parsed.timestamp < 3600000) {
            // Restore context data
            return parsed;
          }
        }
      } catch {}
      return null;
    },
    
    getDefaultInterface() {
      if (!this.user) return null;
      
      if (this.user.role === 'admin') return 'admin';
      if (this.user.role === 'teacher') return 'user'; // Default to user interface for teachers
      if (this.user.role === 'student') return 'user';
      
      return 'user';
    },
    
    setInitialInterface() {
      if (!this.user) return;
      
      // Get saved preference or use default
      const savedInterface = localStorage.getItem('active_interface');
      if (savedInterface && this.validateInterfaceAccess(savedInterface)) {
        this.activeInterface = savedInterface;
      } else {
        this.activeInterface = this.getDefaultInterface();
      }
    }
  },
});
