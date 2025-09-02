import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../views/auth/Login.vue';
import RoleSelection from '../views/RoleSelection.vue';

// Admin views
import Dashboard from '../views/admin/Dashboard.vue';
import UserManagement from '../views/admin/UserManagement.vue';
import QuestionBank from '../views/admin/QuestionBank.vue';
import QuizManagement from '../views/admin/QuizManagement.vue';
import Analytics from '../views/admin/Analytics.vue';
import Submissions from '../views/admin/Submissions.vue';
import Settings from '../views/admin/Settings.vue';
import Production from '../views/admin/Production.vue';

// Student views
import UserDashboard from '../views/user/Dashboard.vue';
import TakeQuiz from '../views/user/TakeQuiz.vue';
import QuizResults from '../views/user/QuizResults.vue';
import QuizHistory from '../views/user/QuizHistory.vue';

const routes = [
  {
    path: '/login',
    component: Login,
    name: 'Login',
    meta: { requiresAuth: false }
  },
  // Role selection for teachers
  {
    path: '/role-selection',
    component: RoleSelection,
    name: 'RoleSelection',
    meta: { requiresAuth: true, roles: ['teacher'] }
  },
  // User routes
  {
    path: '/user/dashboard',
    component: UserDashboard,
    name: 'UserDashboard',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'], interface: 'user' }
  },
  {
    path: '/user/quizzes',
    component: () => import('../views/user/QuizList.vue'),
    name: 'UserQuizzes',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'], interface: 'user' }
  },
  {
    path: '/user/stats',
    component: () => import('../views/user/PersonalStats.vue'),
    name: 'UserStats',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'], interface: 'user' }
  },
  {
    path: '/user/leaderboard',
    component: () => import('../views/user/Leaderboard.vue'),
    name: 'UserLeaderboard',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'], interface: 'user' }
  },
  {
    path: '/user/profile',
    component: UserDashboard,
    name: 'UserProfile',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'], interface: 'user' }
  },
  // Legacy routes for backward compatibility
  {
    path: '/',
    component: UserDashboard,
    name: 'UserDashboardLegacy',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'], interface: 'user' }
  },
  {
    path: '/dashboard',
    component: UserDashboard,
    name: 'StudentDashboard',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'], interface: 'user' }
  },
  {
    path: '/quiz/:id',
    component: TakeQuiz,
    name: 'TakeQuiz',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'] }
  },
  {
    path: '/results/:id',
    component: QuizResults,
    name: 'QuizResults',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'] }
  },
  {
    path: '/history',
    component: QuizHistory,
    name: 'QuizHistory',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'] }
  },
  // Admin routes
  {
    path: '/admin/dashboard',
    component: Dashboard,
    name: 'AdminDashboard',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin/users',
    component: UserManagement,
    name: 'UserManagement',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin/questions',
    component: QuestionBank,
    name: 'QuestionBank',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin/quizzes',
    component: QuizManagement,
    name: 'QuizManagement',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin/submissions',
    component: Submissions,
    name: 'Submissions',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin/analytics',
    component: Analytics,
    name: 'Analytics',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin/production',
    component: Production,
    name: 'Production',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin/settings',
    component: Settings,
    name: 'Settings',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta?.requiresAuth;
  const allowedRoles = to.meta?.roles;
  const auth = useAuthStore();
  
  // initialize from persisted state
  if (!auth.isAuthenticated && !auth.user) {
    auth.initFromStorage?.();
    auth.checkAuth();
  }
  
  if (requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }
  
  // Check role-based access
  if (requiresAuth && allowedRoles && auth.user) {
    const userRole = auth.user.role;
    
    // Check if user has access to this route
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have access - redirect based on role
      if (userRole === 'student') {
        // Student can only access student routes
        return next({ name: 'StudentDashboard' });
      } else if (userRole === 'teacher') {
        // Teacher can access everything, but if trying to access student route, go to admin dashboard
        if (to.path.startsWith('/admin')) {
          next(); // Allow access to admin routes
          return;
        } else {
          // Redirect to admin dashboard for consistency
          return next({ name: 'AdminDashboard' });
        }
      } else if (userRole === 'admin') {
        // Admin can access everything
        next();
        return;
      }
    }
  }
  
  // Enhanced routing logic for teachers
  if (auth.user?.role === 'teacher' && to.path === '/') {
    // Teachers landing on root should go to role selection
    return next({ name: 'RoleSelection' });
  }
  
  // Handle post-login redirects
  if (to.name === 'Login' && auth.isAuthenticated) {
    const initialRoute = auth.getInitialRoute();
    return next(initialRoute);
  }
  
  // Interface-based routing for teachers
  if (auth.user?.role === 'teacher' && to.meta?.interface) {
    const targetInterface = to.meta.interface;
    if (auth.activeInterface !== targetInterface) {
      // Switch interface if needed
      try {
        auth.switchInterface(targetInterface);
      } catch (error) {
        console.error('Failed to switch interface:', error);
        return next({ name: 'RoleSelection' });
      }
    }
  }
  
  next();
});

export default router;
