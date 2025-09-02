// Production Components Index
// Export all production readiness components for easy importing

export { default as BuildSystem } from './BuildSystem.vue'
export { default as LoadTester } from './LoadTester.vue'
export { default as PredictiveAnalytics } from './PredictiveAnalytics.vue'

// Production utilities and constants
export const PRODUCTION_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
}

export const BUILD_MODES = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TESTING: 'testing'
}

export const OPTIMIZATION_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

export const TEST_TYPES = {
  STRESS: 'stress',
  LOAD: 'load',
  SPIKE: 'spike',
  ENDURANCE: 'endurance'
}

export const DEFAULT_PRODUCTION_CONFIG = {
  buildSystem: {
    environment: 'development',
    buildMode: 'development',
    optimizationLevel: 'medium',
    enableAutoBuild: false,
    buildInterval: 300000 // 5 minutes
  },
  loadTester: {
    defaultTestType: 'stress',
    defaultConcurrentUsers: 10,
    defaultTestDuration: 5,
    defaultRampUpTime: 30,
    enableAutoTesting: false,
    testInterval: 600000 // 10 minutes
  },
  predictiveAnalytics: {
    enableAutoAnalysis: false,
    analysisInterval: 300000 // 5 minutes
  }
}

// Production monitoring utilities
export const PRODUCTION_METRICS = {
  BUILD_SUCCESS_RATE: 'buildSuccessRate',
  BUILD_DURATION: 'buildDuration',
  BUNDLE_SIZE: 'bundleSize',
  RESPONSE_TIME: 'responseTime',
  THROUGHPUT: 'throughput',
  ERROR_RATE: 'errorRate',
  CPU_USAGE: 'cpuUsage',
  MEMORY_USAGE: 'memoryUsage'
}

// Build status types
export const BUILD_STATUS = {
  IDLE: 'idle',
  BUILDING: 'building',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

// Test status types
export const TEST_STATUS = {
  IDLE: 'idle',
  STARTING: 'starting',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  STOPPED: 'stopped'
}

// Analysis status types
export const ANALYSIS_STATUS = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// Production event types
export const PRODUCTION_EVENTS = {
  BUILD_STARTED: 'build-started',
  BUILD_COMPLETED: 'build-completed',
  BUILD_FAILED: 'build-failed',
  BUILD_CANCELLED: 'build-cancelled',
  TEST_STARTED: 'test-started',
  TEST_COMPLETED: 'test-completed',
  TEST_FAILED: 'test-failed',
  TEST_STOPPED: 'test-stopped',
  ANALYSIS_STARTED: 'analysis-started',
  ANALYSIS_COMPLETED: 'analysis-completed',
  ANALYSIS_FAILED: 'analysis-failed'
}

// Utility functions
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatTime = (ms) => {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

export const calculateBuildEfficiency = (buildStats) => {
  if (buildStats.totalBuilds === 0) return 0
  
  const successRate = (buildStats.successfulBuilds / buildStats.totalBuilds) * 100
  const avgDuration = buildStats.totalDuration / buildStats.totalBuilds
  
  // Efficiency score based on success rate and duration
  let efficiency = successRate
  
  // Penalize for long build times
  if (avgDuration > 300000) { // > 5 minutes
    efficiency -= 20
  } else if (avgDuration > 60000) { // > 1 minute
    efficiency -= 10
  }
  
  return Math.max(0, Math.round(efficiency))
}

export const calculateTestPerformance = (testStats) => {
  if (testStats.totalTests === 0) return 0
  
  const successRate = (testStats.successfulTests / testStats.totalTests) * 100
  const avgResponseTime = testStats.totalResponseTime / testStats.totalTests
  
  // Performance score based on success rate and response time
  let performance = successRate
  
  // Penalize for slow response times
  if (avgResponseTime > 2000) { // > 2 seconds
    performance -= 30
  } else if (avgResponseTime > 1000) { // > 1 second
    performance -= 15
  }
  
  return Math.max(0, Math.round(performance))
}

export const getProductionRecommendations = (metrics) => {
  const recommendations = []
  
  if (metrics.buildSuccessRate < 90) {
    recommendations.push('Improve build reliability by reviewing build scripts and dependencies')
  }
  
  if (metrics.avgBuildDuration > 300000) {
    recommendations.push('Optimize build process by implementing parallel builds and caching')
  }
  
  if (metrics.bundleSize > 2 * 1024 * 1024) {
    recommendations.push('Reduce bundle size through code splitting and tree shaking')
  }
  
  if (metrics.avgResponseTime > 1000) {
    recommendations.push('Optimize application performance and implement caching strategies')
  }
  
  if (metrics.errorRate > 5) {
    recommendations.push('Investigate and fix error patterns to improve system stability')
  }
  
  if (metrics.cpuUsage > 80) {
    recommendations.push('Consider horizontal scaling or performance optimization')
  }
  
  return recommendations
}

export const validateProductionConfig = (config) => {
  const errors = []
  
  if (!PRODUCTION_ENVIRONMENTS[config.environment?.toUpperCase()]) {
    errors.push('Invalid environment specified')
  }
  
  if (!BUILD_MODES[config.buildMode?.toUpperCase()]) {
    errors.push('Invalid build mode specified')
  }
  
  if (!OPTIMIZATION_LEVELS[config.optimizationLevel?.toUpperCase()]) {
    errors.push('Invalid optimization level specified')
  }
  
  if (config.concurrentUsers && (config.concurrentUsers < 1 || config.concurrentUsers > 1000)) {
    errors.push('Concurrent users must be between 1 and 1000')
  }
  
  if (config.testDuration && (config.testDuration < 1 || config.testDuration > 120)) {
    errors.push('Test duration must be between 1 and 120 minutes')
  }
  
  return errors
}
