// Security Components Index
// Export all security-related components for easy importing

export { default as SecurityWrapper } from './SecurityWrapper.vue'
export { default as AntiCheating } from './AntiCheating.vue'
export { default as SessionManager } from './SessionManager.vue'
export { default as InputValidator } from './InputValidator.vue'
export { default as RateLimiter } from './RateLimiter.vue'

// Security utilities and constants
export const SECURITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export const SECURITY_STATUS = {
  ACTIVE: 'active',
  WARNING: 'warning',
  ERROR: 'error',
  INACTIVE: 'inactive'
}

export const DEFAULT_SECURITY_CONFIG = {
  antiCheating: {
    enabled: true,
    quizDuration: 60,
    strictMode: false,
    showControls: true
  },
  session: {
    enabled: true,
    timeout: 30,
    warningThreshold: 5,
    showStatus: true,
    showActivity: true,
    autoExtend: true,
    maxExtensions: 3
  },
  validation: {
    enabled: true,
    strictMode: false,
    showStatus: true,
    showErrors: true,
    showSummary: false,
    autoValidate: true,
    maxErrors: 10
  },
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    timeWindow: 3600000, // 1 hour
    warningThreshold: 0.8,
    showStatus: true,
    showDashboard: false,
    strictMode: false,
    autoRetry: true,
    retryDelay: 5000
  }
}

// Security validation patterns
export const SECURITY_PATTERNS = {
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ],
  SQL_INJECTION: [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
    /(--|\/\*|\*\/|;)/g
  ],
  COMMAND_INJECTION: [
    /(\b(cmd|command|exec|system|eval|Function|setTimeout|setInterval)\b)/gi,
    /(\$\(|`.*`)/g
  ]
}

// Security event types
export const SECURITY_EVENTS = {
  VIOLATION: 'security-violation',
  THREAT: 'security-threat',
  SESSION_EXPIRED: 'session-expired',
  RATE_LIMIT_EXCEEDED: 'rate-limit-exceeded',
  VALIDATION_ERROR: 'validation-error',
  INPUT_SANITIZED: 'input-sanitized'
}

// Security configuration presets
export const SECURITY_PRESETS = {
  QUIZ_MODE: {
    antiCheating: { enabled: true, strictMode: true, showControls: true },
    session: { enabled: true, timeout: 60, autoExtend: false },
    validation: { enabled: true, strictMode: true, autoValidate: true },
    rateLimit: { enabled: true, maxRequests: 50, strictMode: true }
  },
  ADMIN_MODE: {
    antiCheating: { enabled: false, strictMode: false, showControls: false },
    session: { enabled: true, timeout: 120, autoExtend: true },
    validation: { enabled: true, strictMode: false, autoValidate: false },
    rateLimit: { enabled: true, maxRequests: 500, strictMode: false }
  },
  PUBLIC_MODE: {
    antiCheating: { enabled: false, strictMode: false, showControls: false },
    session: { enabled: false, timeout: 0, autoExtend: false },
    validation: { enabled: true, strictMode: false, autoValidate: true },
    rateLimit: { enabled: true, maxRequests: 20, strictMode: true }
  }
}
