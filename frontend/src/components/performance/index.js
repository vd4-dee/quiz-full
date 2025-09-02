// Performance Components Index
// Export all performance optimization components for easy importing

export { default as LazyLoader } from './LazyLoader.vue'
export { default as VirtualScroller } from './VirtualScroller.vue'
export { default as CacheManager } from './CacheManager.vue'
export { default as BundleOptimizer } from './BundleOptimizer.vue'

// Performance utilities and constants
export const PERFORMANCE_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
}

export const CHUNK_STRATEGIES = {
  ROUTE: 'route',
  COMPONENT: 'component',
  VENDOR: 'vendor',
  DYNAMIC: 'dynamic'
}

export const PRELOAD_STRATEGIES = {
  NONE: 'none',
  VISIBLE: 'visible',
  ADJACENT: 'adjacent',
  ALL: 'all'
}

export const CACHE_EVICTION_POLICIES = {
  LRU: 'lru',
  FIFO: 'fifo',
  RANDOM: 'random'
}

export const DEFAULT_PERFORMANCE_CONFIG = {
  lazyLoader: {
    threshold: 0.1,
    rootMargin: '50px',
    delay: 0,
    placeholderType: 'skeleton',
    showProgress: false,
    preload: false,
    maxConcurrent: 3,
    retryAttempts: 3,
    retryDelay: 1000
  },
  virtualScroller: {
    itemHeight: 50,
    bufferSize: 5,
    overscan: 2,
    maxConcurrent: 10,
    smoothScrolling: true,
    showPerformanceMonitor: false
  },
  cacheManager: {
    maxMemory: 100, // MB
    defaultTTL: 300, // seconds
    maxItems: 1000,
    evictionPolicy: 'lru',
    compression: true,
    persistence: false
  },
  bundleOptimizer: {
    chunkStrategy: 'route',
    preloadStrategy: 'visible',
    enableCompression: true,
    enableAnalysis: true,
    analysisInterval: 30000
  }
}

// Performance monitoring utilities
export const PERFORMANCE_METRICS = {
  FIRST_PAINT: 'firstPaint',
  FIRST_CONTENTFUL_PAINT: 'firstContentfulPaint',
  LARGEST_CONTENTFUL_PAINT: 'largestContentfulPaint',
  TIME_TO_INTERACTIVE: 'timeToInteractive',
  FIRST_INPUT_DELAY: 'firstInputDelay',
  CUMULATIVE_LAYOUT_SHIFT: 'cumulativeLayoutShift'
}

// Bundle size thresholds
export const BUNDLE_SIZE_THRESHOLDS = {
  EXCELLENT: 500 * 1024, // 500KB
  GOOD: 1024 * 1024, // 1MB
  FAIR: 2 * 1024 * 1024, // 2MB
  POOR: Infinity
}

// Cache size thresholds
export const CACHE_SIZE_THRESHOLDS = {
  EXCELLENT: 50 * 1024 * 1024, // 50MB
  GOOD: 100 * 1024 * 1024, // 100MB
  FAIR: 200 * 1024 * 1024, // 200MB
  POOR: Infinity
}

// Performance optimization presets
export const PERFORMANCE_PRESETS = {
  DEVELOPMENT: {
    lazyLoader: { threshold: 0.5, showProgress: true, preload: true },
    virtualScroller: { showPerformanceMonitor: true, bufferSize: 10 },
    cacheManager: { maxMemory: 50, defaultTTL: 60 },
    bundleOptimizer: { enableAnalysis: true, analysisInterval: 10000 }
  },
  PRODUCTION: {
    lazyLoader: { threshold: 0.1, showProgress: false, preload: false },
    virtualScroller: { showPerformanceMonitor: false, bufferSize: 3 },
    cacheManager: { maxMemory: 200, defaultTTL: 600 },
    bundleOptimizer: { enableAnalysis: false, analysisInterval: 60000 }
  },
  PERFORMANCE_TESTING: {
    lazyLoader: { threshold: 0.05, showProgress: true, preload: true },
    virtualScroller: { showPerformanceMonitor: true, bufferSize: 2 },
    cacheManager: { maxMemory: 50, defaultTTL: 30 },
    bundleOptimizer: { enableAnalysis: true, analysisInterval: 5000 }
  }
}

// Performance event types
export const PERFORMANCE_EVENTS = {
  BUNDLE_ANALYZED: 'bundle-analyzed',
  BUNDLE_OPTIMIZED: 'bundle-optimized',
  CACHE_HIT: 'cache-hit',
  CACHE_MISS: 'cache-miss',
  LAZY_LOADING_STARTED: 'loading-started',
  LAZY_LOADING_COMPLETED: 'loading-completed',
  VIRTUAL_SCROLL: 'scroll',
  PERFORMANCE_UPDATE: 'performance-update'
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

export const calculatePerformanceScore = (metrics) => {
  let score = 100
  
  // Deduct points for poor performance
  if (metrics.firstPaint > 200) score -= 10
  if (metrics.firstContentfulPaint > 300) score -= 15
  if (metrics.largestContentfulPaint > 800) score -= 20
  if (metrics.timeToInteractive > 1000) score -= 25
  
  return Math.max(0, score)
}

export const getPerformanceRecommendations = (metrics, bundleSize) => {
  const recommendations = []
  
  if (metrics.firstPaint > 200) {
    recommendations.push('Optimize critical rendering path to reduce first paint time')
  }
  
  if (metrics.firstContentfulPaint > 300) {
    recommendations.push('Implement resource prioritization and preloading')
  }
  
  if (metrics.largestContentfulPaint > 800) {
    recommendations.push('Optimize images and reduce layout shifts')
  }
  
  if (metrics.timeToInteractive > 1000) {
    recommendations.push('Reduce JavaScript bundle size and optimize execution')
  }
  
  if (bundleSize > 1024 * 1024) {
    recommendations.push('Implement code splitting and lazy loading')
  }
  
  return recommendations
}
