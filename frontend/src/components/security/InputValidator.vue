<template>
  <div class="input-validator">
    <!-- Validation Status Indicator -->
    <div 
      v-if="showValidationStatus"
      class="validation-status"
      :class="getValidationStatusClass()"
    >
      <div class="flex items-center space-x-2">
        <component 
          :is="getValidationStatusIcon()"
          class="w-4 h-4"
        />
        <span class="text-sm font-medium">{{ getValidationStatusText() }}</span>
        <span v-if="validationCount > 0" class="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
          {{ validationCount }}
        </span>
      </div>
    </div>

    <!-- Validation Error Display -->
    <div 
      v-if="showValidationErrors && validationErrors.length > 0"
      class="validation-errors bg-red-50 border border-red-200 rounded-md p-3 mb-4"
    >
      <div class="flex items-center mb-2">
        <ExclamationTriangleIcon class="w-5 h-5 text-red-500 mr-2" />
        <h4 class="text-sm font-medium text-red-800">Validation Errors</h4>
      </div>
      <ul class="text-sm text-red-700 space-y-1">
        <li 
          v-for="error in validationErrors" 
          :key="error.id"
          class="flex items-center justify-between"
        >
          <span>{{ error.message }}</span>
          <button 
            @click="dismissError(error.id)"
            class="text-red-500 hover:text-red-700"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="validator-content">
      <slot 
        :validate="validateInput"
        :sanitize="sanitizeInput"
        :validateField="validateField"
        :getFieldErrors="getFieldErrors"
        :clearErrors="clearErrors"
        :validationState="validationState"
      />
    </div>

    <!-- Validation Summary -->
    <div 
      v-if="showValidationSummary && validationSummary"
      class="validation-summary bg-blue-50 border border-blue-200 rounded-md p-3 mt-4"
    >
      <div class="flex items-center mb-2">
        <InformationCircleIcon class="w-5 h-5 text-blue-500 mr-2" />
        <h4 class="text-sm font-medium text-blue-800">Validation Summary</h4>
      </div>
      <div class="text-sm text-blue-700">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="font-medium">Total Fields:</span> {{ validationSummary.totalFields }}
          </div>
          <div>
            <span class="font-medium">Valid:</span> {{ validationSummary.validFields }}
          </div>
          <div>
            <span class="font-medium">Invalid:</span> {{ validationSummary.invalidFields }}
          </div>
          <div>
            <span class="font-medium">Security Level:</span> 
            <span :class="getSecurityLevelClass(validationSummary.securityLevel)">
              {{ validationSummary.securityLevel }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  strictMode: {
    type: Boolean,
    default: false
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  showErrors: {
    type: Boolean,
    default: true
  },
  showSummary: {
    type: Boolean,
    default: false
  },
  autoValidate: {
    type: Boolean,
    default: true
  },
  maxErrors: {
    type: Number,
    default: 10
  }
})

// Emits
const emit = defineEmits([
  'validation-error',
  'validation-success',
  'validation-complete',
  'security-threat',
  'input-sanitized'
])

// Reactive state
const showValidationStatus = ref(props.showStatus)
const showValidationErrors = ref(props.showErrors)
const showValidationSummary = ref(props.showSummary)
const validationCount = ref(0)

// Validation state
const validationState = reactive({
  isValid: true,
  fields: {},
  errors: [],
  warnings: [],
  securityThreats: [],
  lastValidation: null
})

// Validation errors
const validationErrors = ref([])

// Validation rules
const validationRules = reactive({
  // XSS prevention patterns
  xssPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi,
    /<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi,
    /<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi,
    /<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    /<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi
  ],
  
  // SQL injection patterns
  sqlPatterns: [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi,
    /(\b(and|or)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/gi
  ],
  
  // Command injection patterns
  commandPatterns: [
    /(\b(cmd|command|exec|system|eval|Function|setTimeout|setInterval)\b)/gi,
    /(\$\(|`.*`)/g,
    /(\b(window|document|location|history)\b\s*\.)/gi
  ],
  
  // File path traversal patterns
  pathPatterns: [
    /(\.\.\/|\.\.\\)/g,
    /(\/etc\/|\/var\/|\/tmp\/|\/home\/|\/root\/)/gi,
    /(c:\\|d:\\|e:\\)/gi
  ]
})

// Field validation rules
const fieldRules = reactive({
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number'
  },
  url: {
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    message: 'Please enter a valid URL'
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    message: 'Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters'
  }
})

// Methods
const validateInput = (input, fieldName = 'input', rules = {}) => {
  if (!props.enabled) return { isValid: true, errors: [] }
  
  const errors = []
  const warnings = []
  const securityThreats = []
  
  // Basic input validation
  if (rules.required && (!input || input.trim() === '')) {
    errors.push({
      type: 'required',
      message: `${fieldName} is required`,
      severity: 'error'
    })
  }
  
  if (input && input.length > 0) {
    // Length validation
    if (rules.minLength && input.length < rules.minLength) {
      errors.push({
        type: 'minLength',
        message: `${fieldName} must be at least ${rules.minLength} characters`,
        severity: 'error'
      })
    }
    
    if (rules.maxLength && input.length > rules.maxLength) {
      errors.push({
        type: 'maxLength',
        message: `${fieldName} must be no more than ${rules.maxLength} characters`,
        severity: 'error'
      })
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(input)) {
      errors.push({
        type: 'pattern',
        message: rules.message || `${fieldName} format is invalid`,
        severity: 'error'
      })
    }
    
    // Security validation
    const securityResults = validateSecurity(input, fieldName)
    securityThreats.push(...securityResults.threats)
    warnings.push(...securityResults.warnings)
    
    // Custom validation
    if (rules.custom) {
      try {
        const customResult = rules.custom(input)
        if (customResult && !customResult.isValid) {
          errors.push({
            type: 'custom',
            message: customResult.message || `${fieldName} validation failed`,
            severity: 'error'
          })
        }
      } catch (error) {
        console.error('Custom validation error:', error)
        errors.push({
          type: 'custom',
          message: `${fieldName} validation error`,
          severity: 'error'
        })
      }
    }
  }
  
  // Update validation state
  updateValidationState(fieldName, {
    isValid: errors.length === 0 && securityThreats.length === 0,
    errors,
    warnings,
    securityThreats,
    lastValidated: Date.now()
  })
  
  // Emit events
  if (errors.length > 0 || securityThreats.length > 0) {
    emit('validation-error', {
      field: fieldName,
      errors,
      securityThreats,
      timestamp: Date.now()
    })
  } else {
    emit('validation-success', {
      field: fieldName,
      timestamp: Date.now()
    })
  }
  
  return {
    isValid: errors.length === 0 && securityThreats.length === 0,
    errors,
    warnings,
    securityThreats
  }
}

const validateSecurity = (input, fieldName) => {
  const threats = []
  const warnings = []
  
  // XSS detection
  validationRules.xssPatterns.forEach((pattern, index) => {
    if (pattern.test(input)) {
      threats.push({
        type: 'xss',
        pattern: pattern.toString(),
        field: fieldName,
        severity: 'high',
        message: `Potential XSS attack detected in ${fieldName}`
      })
    }
  })
  
  // SQL injection detection
  validationRules.sqlPatterns.forEach((pattern, index) => {
    if (pattern.test(input)) {
      threats.push({
        type: 'sql_injection',
        pattern: pattern.toString(),
        field: fieldName,
        severity: 'high',
        message: `Potential SQL injection detected in ${fieldName}`
      })
    }
  })
  
  // Command injection detection
  validationRules.commandPatterns.forEach((pattern, index) => {
    if (pattern.test(input)) {
      threats.push({
        type: 'command_injection',
        pattern: pattern.toString(),
        field: fieldName,
        severity: 'high',
        message: `Potential command injection detected in ${fieldName}`
      })
    }
  })
  
  // Path traversal detection
  validationRules.pathPatterns.forEach((pattern, index) => {
    if (pattern.test(input)) {
      threats.push({
        type: 'path_traversal',
        pattern: pattern.toString(),
        field: fieldName,
        severity: 'medium',
        message: `Potential path traversal detected in ${fieldName}`
      })
    }
  })
  
  // Suspicious patterns
  if (input.includes('eval(') || input.includes('Function(')) {
    warnings.push({
      type: 'suspicious_code',
      field: fieldName,
      severity: 'medium',
      message: `Suspicious code pattern detected in ${fieldName}`
    })
  }
  
  // Emit security threats
  if (threats.length > 0) {
    emit('security-threat', {
      threats,
      field: fieldName,
      timestamp: Date.now()
    })
  }
  
  return { threats, warnings }
}

const validateField = (fieldName, rules = {}) => {
  const field = validationState.fields[fieldName]
  if (!field) return { isValid: false, errors: [] }
  
  return validateInput(field.value, fieldName, rules)
}

const sanitizeInput = (input, options = {}) => {
  if (!input) return input
  
  let sanitized = input.toString()
  
  // Remove HTML tags
  if (options.removeHtml !== false) {
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  }
  
  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove JavaScript protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove CSS expressions
  sanitized = sanitized.replace(/expression\s*\(/gi, '')
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim()
  }
  
  // Emit sanitization event
  emit('input-sanitized', {
    original: input,
    sanitized,
    timestamp: Date.now()
  })
  
  return sanitized
}

const updateValidationState = (fieldName, fieldState) => {
  validationState.fields[fieldName] = {
    ...validationState.fields[fieldName],
    ...fieldState
  }
  
  // Update overall validation state
  const allFields = Object.values(validationState.fields)
  validationState.isValid = allFields.every(field => field.isValid)
  validationState.lastValidation = Date.now()
  
  // Update validation count
  validationCount.value = allFields.filter(field => !field.isValid).length
  
  // Emit validation complete event
  emit('validation-complete', {
    isValid: validationState.isValid,
    fields: validationState.fields,
    timestamp: Date.now()
  })
}

const getFieldErrors = (fieldName) => {
  const field = validationState.fields[fieldName]
  return field ? field.errors : []
}

const clearErrors = (fieldName = null) => {
  if (fieldName) {
    if (validationState.fields[fieldName]) {
      validationState.fields[fieldName].errors = []
      validationState.fields[fieldName].warnings = []
      validationState.fields[fieldName].securityThreats = []
    }
  } else {
    // Clear all errors
    Object.keys(validationState.fields).forEach(field => {
      if (validationState.fields[field]) {
        validationState.fields[field].errors = []
        validationState.fields[field].warnings = []
        validationState.fields[field].securityThreats = []
      }
    })
  }
  
  // Update validation state
  updateValidationState()
}

const dismissError = (errorId) => {
  const index = validationErrors.value.findIndex(error => error.id === errorId)
  if (index > -1) {
    validationErrors.value.splice(index, 1)
  }
}

// Computed properties
const validationSummary = computed(() => {
  const fields = Object.values(validationState.fields)
  if (fields.length === 0) return null
  
  const totalFields = fields.length
  const validFields = fields.filter(field => field.isValid).length
  const invalidFields = totalFields - validFields
  
  // Calculate security level
  const securityThreats = fields.reduce((total, field) => 
    total + (field.securityThreats ? field.securityThreats.length : 0), 0
  )
  
  let securityLevel = 'High'
  if (securityThreats > 5) securityLevel = 'Low'
  else if (securityThreats > 2) securityLevel = 'Medium'
  
  return {
    totalFields,
    validFields,
    invalidFields,
    securityLevel,
    securityThreats
  }
})

// Utility methods
const getValidationStatusClass = () => {
  if (validationCount.value === 0) return 'bg-green-100 text-green-800 border-green-200'
  if (validationCount.value <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

const getValidationStatusIcon = () => {
  if (validationCount.value === 0) return CheckCircleIcon
  if (validationCount.value <= 3) return ExclamationCircleIcon
  return ExclamationTriangleIcon
}

const getValidationStatusText = () => {
  if (validationCount.value === 0) return 'All inputs valid'
  if (validationCount.value <= 3) return 'Validation warnings'
  return 'Validation errors'
}

const getSecurityLevelClass = (level) => {
  const classes = {
    'High': 'text-green-600 font-semibold',
    'Medium': 'text-yellow-600 font-semibold',
    'Low': 'text-red-600 font-semibold'
  }
  return classes[level] || 'text-gray-600'
}

// Watchers
watch(() => props.enabled, (newValue) => {
  if (!newValue) {
    clearErrors()
    validationCount.value = 0
  }
})

// Lifecycle
onMounted(() => {
  // Initialize validation state
  if (props.enabled) {
    validationState.isValid = true
    validationState.lastValidation = Date.now()
  }
})
</script>

<style scoped>
.input-validator {
  position: relative;
}

.validation-status {
  position: fixed;
  top-4 left-4 z-50 px-3 py-2 rounded-md border text-sm font-medium shadow-lg
}

.validator-content {
  position: relative;
  z-index: 10;
}

.validation-errors {
  animation: slideIn 0.3s ease-out;
}

.validation-summary {
  animation: fadeIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Validation status animations */
.validation-status-enter-active,
.validation-status-leave-active {
  transition: all 0.3s ease;
}

.validation-status-enter-from,
.validation-status-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
