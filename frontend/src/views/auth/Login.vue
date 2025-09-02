<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
    </div>
    
    <div class="max-w-md w-full space-y-8 relative z-10">
      <!-- Logo/Brand Section -->
      <div class="text-center">
        <div class="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
          <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <h2 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quiz System</h2>
        <p class="mt-3 text-sm text-gray-600 font-medium">Welcome back! Please sign in to continue</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-700">Email Address</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input 
                id="email" 
                v-model="form.email"
                type="email" 
                required
                autocomplete="email"
                class="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white/80"
                placeholder="Enter your email address"
                :class="{
                  'border-red-400 focus:ring-red-500/20 focus:border-red-500': errors.email, 
                  'border-green-400 focus:ring-green-500/20 focus:border-green-500': form.email && !errors.email && isValidEmail
                }"
                @blur="validateEmail"
                @input="clearError('email'); validateEmail()"
                @keydown.enter="focusPassword"
              />
            </div>
            <transition name="slide-down">
              <p v-if="errors.email" class="text-sm text-red-600 flex items-center mt-2">
                <svg class="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ errors.email }}
              </p>
            </transition>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-gray-700">Password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input 
                id="password"
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white/80"
                placeholder="Enter your password"
                :class="{
                  'border-red-400 focus:ring-red-500/20 focus:border-red-500': errors.password, 
                  'border-green-400 focus:ring-green-500/20 focus:border-green-500': form.password && !errors.password && isValidPassword
                }"
                @blur="validatePassword"
                @input="clearError('password'); validatePassword()"
                @keydown.enter="handleSubmit"
              />
              <button 
                type="button"
                @click="togglePassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              </button>
            </div>
            
            <!-- Password Strength Indicator -->
            <div v-if="form.password && !errors.password" class="mt-2">
              <div class="flex items-center space-x-2">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrength + '%' }"
                  ></div>
                </div>
                <span class="text-xs font-medium" :class="passwordStrengthTextClass">{{ passwordStrengthText }}</span>
              </div>
            </div>
            
            <transition name="slide-down">
              <p v-if="errors.password" class="text-sm text-red-600 flex items-center mt-2">
                <svg class="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ errors.password }}
              </p>
            </transition>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center group">
              <input 
                id="remember" 
                v-model="form.remember"
                type="checkbox" 
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 cursor-pointer"
              />
              <label for="remember" class="ml-3 block text-sm text-gray-700 cursor-pointer select-none group-hover:text-gray-900 transition-colors duration-200">Remember me</label>
            </div>
            <button 
              type="button" 
              @click="handleForgotPassword"
              class="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 py-1"
            >
              Forgot password?
            </button>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[52px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="!loading" class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Sign in
            </span>
            <span v-else>Signing in...</span>
          </button>

          <!-- Error Message -->
          <transition name="slide-down">
            <div v-if="authError" class="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
              <div class="flex items-start">
                <svg class="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-red-800">{{ authError }}</p>
                  <p v-if="loginAttempts > 2" class="text-xs text-red-600 mt-1">Too many failed attempts. Please try again later.</p>
                </div>
              </div>
            </div>
          </transition>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center text-sm text-gray-500">
        <p>&copy; 2025 Quiz System. All rights reserved.</p>
        <p class="mt-1 text-xs text-gray-400">Secure login powered by modern authentication</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

// Form data
const form = ref({
  email: '',
  password: '',
  remember: false
});

// UI state
const loading = ref(false);
const showPassword = ref(false);
const authError = ref('');
const loginAttempts = ref(0);

// Validation errors
const errors = ref({
  email: '',
  password: ''
});

// Computed properties
const isFormValid = computed(() => {
  return form.value.email && form.value.password && !errors.value.email && !errors.value.password;
});

const isValidEmail = computed(() => {
  const email = form.value.email;
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
});

const isValidPassword = computed(() => {
  const password = form.value.password;
  return password && password.length >= 6;
});

// Password strength calculation
const passwordStrength = computed(() => {
  const password = form.value.password;
  if (!password) return 0;
  
  let strength = 0;
  if (password.length >= 6) strength += 20;
  if (password.length >= 8) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
});

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 40) return 'bg-red-500';
  if (strength < 70) return 'bg-yellow-500';
  return 'bg-green-500';
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 40) return 'Weak';
  if (strength < 70) return 'Medium';
  return 'Strong';
});

const passwordStrengthTextClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 40) return 'text-red-600';
  if (strength < 70) return 'text-yellow-600';
  return 'text-green-600';
});

// Validation functions
const validateEmail = () => {
  const email = form.value.email;
  if (!email) {
    errors.value.email = 'Email is required';
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.value.email = 'Please enter a valid email address';
    return false;
  }
  errors.value.email = '';
  return true;
};

const validatePassword = () => {
  const password = form.value.password;
  if (!password) {
    errors.value.password = 'Password is required';
    return false;
  }
  if (password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
    return false;
  }
  errors.value.password = '';
  return true;
};

const clearError = (field) => {
  if (errors.value[field]) {
    errors.value[field] = '';
  }
  if (authError.value) {
    authError.value = '';
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const focusPassword = () => {
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.focus();
  }
};

const handleForgotPassword = () => {
  // TODO: Implement forgot password functionality
  console.log('Forgot password clicked');
  // For now, show a simple alert
  alert('Password reset functionality will be implemented soon. Please contact your administrator.');
};

const handleSubmit = async () => {
  // Clear previous errors
  authError.value = '';
  
  // Validate form
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  
  if (!isEmailValid || !isPasswordValid) {
    return;
  }

  // Rate limiting check
  if (loginAttempts.value >= 5) {
    authError.value = 'Too many failed attempts. Please wait 5 minutes before trying again.';
    return;
  }

  try {
    loading.value = true;
    
    // Sanitize inputs
    const sanitizedEmail = form.value.email.trim().toLowerCase();
    const sanitizedPassword = form.value.password;
    
    const result = await auth.login(sanitizedEmail, sanitizedPassword);
    
    if (result.success) {
      // Reset login attempts on success
      loginAttempts.value = 0;
      
      // Handle remember me
      if (form.value.remember) {
        localStorage.setItem('remember_email', sanitizedEmail);
      } else {
        localStorage.removeItem('remember_email');
      }
      
      // Redirect to intended page or dashboard
      const redirectTo = route.query.redirect || '/admin/dashboard';
      router.replace(String(redirectTo));
    } else {
      loginAttempts.value++;
      authError.value = result.error || 'Login failed. Please check your credentials.';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginAttempts.value++;
    authError.value = 'An unexpected error occurred. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Load remembered email on mount
onMounted(() => {
  const rememberedEmail = localStorage.getItem('remember_email');
  if (rememberedEmail) {
    form.value.email = rememberedEmail;
    form.value.remember = true;
  }
  
  // Focus on email input
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.focus();
  }
});
</script>

<style scoped>
/* Custom focus styles for better accessibility */
input:focus {
  outline: none;
}

/* Smooth transitions for form elements */
input, button {
  transition: all 0.2s ease-in-out;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  accent-color: #2563eb;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Slide down transition for error messages */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Enhanced hover effects */
.group:hover .group-hover\:text-gray-900 {
  color: rgb(17 24 39);
}

/* Glass morphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Custom gradient text */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Enhanced button animations */
.transform {
  transform: translateZ(0);
}

.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}

.active\:scale-\[0\.98\]:active {
  transform: scale(0.98);
}

/* Password strength indicator animation */
.bg-red-500,
.bg-yellow-500,
.bg-green-500 {
  transition: all 0.3s ease-in-out;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-md {
    max-width: 100%;
  }
  
  .p-8 {
    padding: 1.5rem;
  }
  
  .text-4xl {
    font-size: 2rem;
  }
  
  .h-20 {
    height: 4rem;
  }
  
  .w-20 {
    width: 4rem;
  }
}

/* Dark mode support (if needed in future) */
@media (prefers-color-scheme: dark) {
  .bg-white\/80 {
    background-color: rgba(31, 41, 55, 0.8);
  }
  
  .text-gray-900 {
    color: rgb(243 244 246);
  }
  
  .text-gray-700 {
    color: rgb(209 213 219);
  }
  
  .text-gray-600 {
    color: rgb(156 163 175);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: rgb(0 0 0);
  }
  
  .text-gray-500 {
    color: rgb(0 0 0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .transform {
    transform: none !important;
  }
}
</style>
