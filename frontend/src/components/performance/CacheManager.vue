<template>
  <div class="cache-manager">
    <!-- Cache Status Dashboard -->
    <div 
      v-if="showDashboard"
      class="cache-dashboard"
      :class="dashboardClass"
    >
      <div class="dashboard-header">
        <h3 class="dashboard-title">Cache Manager</h3>
        <div class="dashboard-actions">
          <button 
            @click="clearAllCaches"
            class="action-btn clear-all"
            title="Clear all caches"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
          <button 
            @click="toggleDashboard"
            class="action-btn toggle"
            title="Hide dashboard"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="cache-stats">
        <div class="stat-item">
          <span class="stat-label">Memory Usage:</span>
          <span class="stat-value">{{ formatBytes(memoryUsage) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Hit Rate:</span>
          <span class="stat-value">{{ hitRatePercentage }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Items:</span>
          <span class="stat-value">{{ totalCachedItems }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Cache Size:</span>
          <span class="stat-value">{{ formatBytes(totalCacheSize) }}</span>
        </div>
      </div>
      
      <div class="cache-controls">
        <div class="control-group">
          <label class="control-label">Max Memory:</label>
          <input 
            v-model.number="maxMemoryMB"
            type="number"
            min="1"
            max="1000"
            class="control-input"
            @change="updateMaxMemory"
          />
          <span class="control-unit">MB</span>
        </div>
        
        <div class="control-group">
          <label class="control-label">TTL:</label>
          <input 
            v-model.number="defaultTTL"
            type="number"
            min="1"
            max="3600"
            class="control-input"
            @change="updateDefaultTTL"
          />
          <span class="control-unit">seconds</span>
        </div>
      </div>
      
      <div class="cache-actions">
        <button 
          @click="optimizeCache"
          class="action-btn optimize"
          :disabled="isOptimizing"
        >
          <span v-if="isOptimizing">Optimizing...</span>
          <span v-else>Optimize</span>
        </button>
        <button 
          @click="exportCacheStats"
          class="action-btn export"
        >
          Export Stats
        </button>
        <button 
          @click="showCacheDetails = !showCacheDetails"
          class="action-btn details"
        >
          {{ showCacheDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      
      <!-- Cache Details -->
      <div 
        v-if="showCacheDetails"
        class="cache-details"
      >
        <div class="detail-section">
          <h4 class="detail-title">Cache Types</h4>
          <div class="detail-grid">
            <div 
              v-for="(stats, type) in cacheTypeStats"
              :key="type"
              class="detail-item"
            >
              <span class="detail-label">{{ type }}:</span>
              <span class="detail-value">{{ stats.count }} items</span>
              <span class="detail-size">{{ formatBytes(stats.size) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4 class="detail-title">Recent Operations</h4>
          <div class="operations-list">
            <div 
              v-for="op in recentOperations.slice(0, 10)"
              :key="op.id"
              class="operation-item"
              :class="op.type"
            >
              <span class="operation-type">{{ op.type }}</span>
              <span class="operation-key">{{ op.key }}</span>
              <span class="operation-time">{{ formatTime(op.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cache Toggle Button -->
    <button 
      v-if="!showDashboard"
      @click="toggleDashboard"
      class="cache-toggle-btn"
      :class="cacheStatusClass"
      :title="`Cache: ${cacheStatusText}`"
    >
      <CogIcon class="w-5 h-5" />
    </button>
    
    <!-- Main Content -->
    <div class="cache-content">
      <slot 
        :cache="cache"
        :get="getFromCache"
        :set="setInCache"
        :delete="deleteFromCache"
        :clear="clearCache"
        :has="hasInCache"
        :getStats="getCacheStats"
        :optimize="optimizeCache"
        :cacheStatus="cacheStatus"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  CogIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  // Cache configuration
  maxMemory: {
    type: Number,
    default: 100 // MB
  },
  defaultTTL: {
    type: Number,
    default: 300 // 5 minutes
  },
  maxItems: {
    type: Number,
    default: 1000
  },
  
  // UI configuration
  showDashboard: {
    type: Boolean,
    default: false
  },
  dashboardClass: {
    type: String,
    default: ''
  },
  
  // Cache strategies
  evictionPolicy: {
    type: String,
    default: 'lru' // lru, fifo, random
  },
  compression: {
    type: Boolean,
    default: true
  },
  persistence: {
    type: Boolean,
    default: false
  },
  
  // Performance monitoring
  enableMonitoring: {
    type: Boolean,
    default: true
  },
  monitoringInterval: {
    type: Number,
    default: 5000 // 5 seconds
  }
})

// Emits
const emit = defineEmits([
  'cache-hit',
  'cache-miss',
  'cache-set',
  'cache-delete',
  'cache-clear',
  'cache-optimize',
  'cache-stats-update',
  'memory-warning'
])

// Reactive state
const showDashboard = ref(props.showDashboard)
const showCacheDetails = ref(false)
const isOptimizing = ref(false)
const maxMemoryMB = ref(props.maxMemory)
const defaultTTL = ref(props.defaultTTL)

// Cache storage
const cache = reactive(new Map())
const cacheMetadata = reactive(new Map())
const cacheStats = reactive({
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  clears: 0,
  totalSize: 0,
  lastOptimization: null
})

// Cache types
const cacheTypes = {
  data: 'data',
  component: 'component',
  api: 'api',
  image: 'image',
  route: 'route'
}

// Recent operations
const recentOperations = ref([])
const operationId = ref(0)

// Monitoring
let monitoringInterval = null
let lastMemoryCheck = 0

// Computed properties
const hitRatePercentage = computed(() => {
  const total = cacheStats.hits + cacheStats.misses
  if (total === 0) return 0
  return Math.round((cacheStats.hits / total) * 100)
})

const totalCachedItems = computed(() => cache.size)

const totalCacheSize = computed(() => cacheStats.totalSize)

const memoryUsage = computed(() => {
  // Estimate memory usage based on cache size and item count
  return cacheStats.totalSize + (totalCachedItems.value * 100) // 100 bytes per item overhead
})

const cacheStatus = computed(() => {
  const usage = memoryUsage.value / (maxMemoryMB.value * 1024 * 1024)
  if (usage > 0.9) return 'critical'
  if (usage > 0.7) return 'warning'
  if (usage > 0.5) return 'normal'
  return 'good'
})

const cacheStatusClass = computed(() => {
  const status = cacheStatus.value
  return `status-${status}`
})

const cacheStatusText = computed(() => {
  const status = cacheStatus.value
  const usage = Math.round((memoryUsage.value / (maxMemoryMB.value * 1024 * 1024)) * 100)
  return `${status} (${usage}%)`
})

const cacheTypeStats = computed(() => {
  const stats = {}
  
  Object.values(cacheTypes).forEach(type => {
    stats[type] = { count: 0, size: 0 }
  })
  
  cacheMetadata.forEach((metadata, key) => {
    const type = metadata.type || 'data'
    if (stats[type]) {
      stats[type].count++
      stats[type].size += metadata.size || 0
    }
  })
  
  return stats
})

// Methods
const generateKey = (key, type = 'data') => {
  return `${type}:${key}`
}

const estimateSize = (value) => {
  try {
    const serialized = JSON.stringify(value)
    return new Blob([serialized]).size
  } catch {
    return 100 // Fallback size
  }
}

const compressData = (data) => {
  if (!props.compression) return data
  
  try {
    // Simple compression for strings
    if (typeof data === 'string' && data.length > 100) {
      // Basic compression logic (in production, use proper compression libraries)
      return data.replace(/\s+/g, ' ').trim()
    }
    return data
  } catch {
    return data
  }
}

const decompressData = (data) => {
  if (!props.compression) return data
  return data
}

const setInCache = (key, value, options = {}) => {
  const {
    type = 'data',
    ttl = defaultTTL.value,
    priority = 'normal',
    compress = props.compression
  } = options
  
  const cacheKey = generateKey(key, type)
  const size = estimateSize(value)
  
  // Check memory limits
  if (memoryUsage.value + size > maxMemoryMB.value * 1024 * 1024) {
    evictItems(size)
  }
  
  // Compress if enabled
  const processedValue = compress ? compressData(value) : value
  
  // Set in cache
  cache.set(cacheKey, processedValue)
  
  // Set metadata
  cacheMetadata.set(cacheKey, {
    type,
    size,
    ttl,
    priority,
    timestamp: Date.now(),
    accessCount: 0,
    lastAccess: Date.now()
  })
  
  // Update stats
  cacheStats.sets++
  cacheStats.totalSize += size
  
  // Add to recent operations
  addOperation('set', cacheKey)
  
  // Emit event
  emit('cache-set', {
    key: cacheKey,
    type,
    size,
    timestamp: Date.now()
  })
  
  // Set expiration
  if (ttl > 0) {
    setTimeout(() => {
      deleteFromCache(cacheKey)
    }, ttl * 1000)
  }
  
  return true
}

const getFromCache = (key, type = 'data') => {
  const cacheKey = generateKey(key, type)
  
  if (cache.has(cacheKey)) {
    // Cache hit
    const value = cache.get(cacheKey)
    const metadata = cacheMetadata.get(cacheKey)
    
    // Update access stats
    if (metadata) {
      metadata.accessCount++
      metadata.lastAccess = Date.now()
    }
    
    cacheStats.hits++
    
    // Add to recent operations
    addOperation('hit', cacheKey)
    
    // Emit event
    emit('cache-hit', {
      key: cacheKey,
      type,
      timestamp: Date.now()
    })
    
    // Decompress if needed
    return props.compression ? decompressData(value) : value
  } else {
    // Cache miss
    cacheStats.misses++
    
    // Add to recent operations
    addOperation('miss', cacheKey)
    
    // Emit event
    emit('cache-miss', {
      key: cacheKey,
      type,
      timestamp: Date.now()
    })
    
    return null
  }
}

const hasInCache = (key, type = 'data') => {
  const cacheKey = generateKey(key, type)
  return cache.has(cacheKey)
}

const deleteFromCache = (key, type = 'data') => {
  const cacheKey = generateKey(key, type)
  
  if (cache.has(cacheKey)) {
    const metadata = cacheMetadata.get(cacheKey)
    const size = metadata ? metadata.size : 0
    
    cache.delete(cacheKey)
    cacheMetadata.delete(cacheKey)
    
    cacheStats.deletes++
    cacheStats.totalSize -= size
    
    // Add to recent operations
    addOperation('delete', cacheKey)
    
    // Emit event
    emit('cache-delete', {
      key: cacheKey,
      type,
      size,
      timestamp: Date.now()
    })
    
    return true
  }
  
  return false
}

const clearCache = (type = null) => {
  if (type) {
    // Clear specific type
    const keysToDelete = []
    
    cacheMetadata.forEach((metadata, key) => {
      if (metadata.type === type) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      deleteFromCache(key)
    })
  } else {
    // Clear all
    cache.clear()
    cacheMetadata.clear()
    cacheStats.totalSize = 0
    cacheStats.clears++
    
    // Add to recent operations
    addOperation('clear', 'all')
    
    // Emit event
    emit('cache-clear', {
      timestamp: Date.now()
    })
  }
}

const clearAllCaches = () => {
  clearCache()
}

const evictItems = (requiredSize) => {
  const items = []
  
  cacheMetadata.forEach((metadata, key) => {
    items.push({
      key,
      metadata,
      score: calculateEvictionScore(metadata)
    })
  })
  
  // Sort by eviction score
  items.sort((a, b) => a.score - b.score)
  
  let freedSize = 0
  const itemsToEvict = []
  
  for (const item of items) {
    if (freedSize >= requiredSize) break
    
    itemsToEvict.push(item.key)
    freedSize += item.metadata.size
  }
  
  // Evict items
  itemsToEvict.forEach(key => {
    deleteFromCache(key)
  })
}

const calculateEvictionScore = (metadata) => {
  const now = Date.now()
  const age = now - metadata.timestamp
  const lastAccess = now - metadata.lastAccess
  
  let score = 0
  
  // LRU scoring
  if (props.evictionPolicy === 'lru') {
    score = lastAccess + (age * 0.1)
  }
  // FIFO scoring
  else if (props.evictionPolicy === 'fifo') {
    score = age
  }
  // Random scoring
  else {
    score = Math.random()
  }
  
  // Priority adjustment
  if (metadata.priority === 'high') score *= 0.5
  if (metadata.priority === 'low') score *= 2
  
  return score
}

const optimizeCache = async () => {
  if (isOptimizing.value) return
  
  isOptimizing.value = true
  
  try {
    // Remove expired items
    const now = Date.now()
    const keysToDelete = []
    
    cacheMetadata.forEach((metadata, key) => {
      if (metadata.ttl > 0 && (now - metadata.timestamp) > metadata.ttl * 1000) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      deleteFromCache(key)
    })
    
    // Compact cache
    if (props.compression) {
      // Re-compress items for better efficiency
      const items = Array.from(cache.entries())
      
      for (const [key, value] of items) {
        const compressed = compressData(value)
        if (compressed !== value) {
          cache.set(key, compressed)
          const metadata = cacheMetadata.get(key)
          if (metadata) {
            const newSize = estimateSize(compressed)
            cacheStats.totalSize -= metadata.size
            metadata.size = newSize
            cacheStats.totalSize += newSize
          }
        }
      }
    }
    
    // Update optimization timestamp
    cacheStats.lastOptimization = Date.now()
    
    // Emit event
    emit('cache-optimize', {
      timestamp: Date.now(),
      itemsRemoved: keysToDelete.length
    })
    
  } finally {
    isOptimizing.value = false
  }
}

const getCacheStats = () => {
  return {
    ...cacheStats,
    hitRate: hitRatePercentage.value,
    totalItems: totalCachedItems.value,
    totalSize: totalCacheSize.value,
    memoryUsage: memoryUsage.value,
    maxMemory: maxMemoryMB.value * 1024 * 1024,
    cacheStatus: cacheStatus.value
  }
}

const addOperation = (type, key) => {
  const operation = {
    id: ++operationId.value,
    type,
    key,
    timestamp: Date.now()
  }
  
  recentOperations.value.unshift(operation)
  
  // Keep only last 100 operations
  if (recentOperations.value.length > 100) {
    recentOperations.value = recentOperations.value.slice(0, 100)
  }
}

const updateMaxMemory = () => {
  // Trigger optimization if new limit is lower than current usage
  if (memoryUsage.value > maxMemoryMB.value * 1024 * 1024) {
    optimizeCache()
  }
}

const updateDefaultTTL = () => {
  // Update TTL for existing items (optional)
}

const toggleDashboard = () => {
  showDashboard.value = !showDashboard.value
}

const exportCacheStats = () => {
  const stats = getCacheStats()
  const dataStr = JSON.stringify(stats, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `cache-stats-${Date.now()}.json`
  link.click()
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(timestamp).toLocaleDateString()
}

// Monitoring
const startMonitoring = () => {
  if (!props.enableMonitoring) return
  
  monitoringInterval = setInterval(() => {
    // Check memory usage
    if (memoryUsage.value > maxMemoryMB.value * 1024 * 1024 * 0.8) {
      emit('memory-warning', {
        current: memoryUsage.value,
        max: maxMemoryMB.value * 1024 * 1024,
        percentage: (memoryUsage.value / (maxMemoryMB.value * 1024 * 1024)) * 100
      })
    }
    
    // Emit stats update
    emit('cache-stats-update', getCacheStats())
    
  }, props.monitoringInterval)
}

const stopMonitoring = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }
}

// Lifecycle
onMounted(() => {
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})

// Expose methods
defineExpose({
  cache,
  getFromCache,
  setInCache,
  deleteFromCache,
  clearCache,
  hasInCache,
  getStats: getCacheStats,
  optimize: optimizeCache,
  cacheStatus: computed(() => cacheStatus.value)
})
</script>

<style scoped>
.cache-manager {
  position: relative;
}

.cache-dashboard {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 320px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  font-size: 0.875rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dashboard-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.clear-all {
  background: #ef4444;
  color: white;
}

.action-btn.clear-all:hover {
  background: #dc2626;
}

.action-btn.toggle {
  background: #6b7280;
  color: white;
}

.action-btn.toggle:hover {
  background: #4b5563;
}

.cache-stats {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  color: #111827;
  font-weight: 600;
}

.cache-controls {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.control-group {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  width: 80px;
  color: #6b7280;
  font-size: 0.75rem;
}

.control-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  text-align: center;
}

.control-unit {
  margin-left: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.cache-actions {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn.optimize,
.action-btn.export,
.action-btn.details {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.action-btn.optimize:hover,
.action-btn.export:hover,
.action-btn.details:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn.optimize:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cache-details {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.detail-item {
  display: contents;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  color: #111827;
  font-weight: 500;
}

.detail-size {
  color: #6b7280;
  text-align: right;
}

.operations-list {
  max-height: 200px;
  overflow-y: auto;
}

.operation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.operation-item:last-child {
  border-bottom: none;
}

.operation-item.hit {
  color: #059669;
}

.operation-item.miss {
  color: #dc2626;
}

.operation-item.set {
  color: #2563eb;
}

.operation-item.delete {
  color: #7c3aed;
}

.operation-item.clear {
  color: #ea580c;
}

.operation-type {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.625rem;
}

.operation-key {
  flex: 1;
  margin: 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operation-time {
  color: #6b7280;
  font-size: 0.625rem;
}

.cache-toggle-btn {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 50%;
  background: #6b7280;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cache-toggle-btn:hover {
  transform: scale(1.1);
}

.cache-toggle-btn.status-good {
  background: #10b981;
}

.cache-toggle-btn.status-normal {
  background: #3b82f6;
}

.cache-toggle-btn.status-warning {
  background: #f59e0b;
}

.cache-toggle-btn.status-critical {
  background: #ef4444;
}

.cache-content {
  width: 100%;
}

/* Responsive design */
@media (max-width: 640px) {
  .cache-dashboard {
    width: calc(100vw - 2rem);
    right: 1rem;
    left: 1rem;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .operation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
