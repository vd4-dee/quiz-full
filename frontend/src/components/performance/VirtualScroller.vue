<template>
  <div 
    ref="virtualScroller"
    class="virtual-scroller"
    :class="containerClass"
    :style="containerStyle"
    @scroll="handleScroll"
    @resize="handleResize"
  >
    <!-- Scroll Container -->
    <div 
      class="scroll-container"
      :style="scrollContainerStyle"
    >
      <!-- Spacer for scroll height -->
      <div 
        class="scroll-spacer"
        :style="{ height: `${totalHeight}px` }"
      ></div>
      
      <!-- Visible Items Container -->
      <div 
        class="visible-items-container"
        :style="visibleItemsStyle"
      >
        <div
          v-for="item in visibleItems"
          :key="getItemKey(item, item.index)"
          :data-index="item.index"
          class="virtual-item"
          :class="getItemClass(item)"
          :style="getItemStyle(item)"
        >
          <slot 
            :item="item.data"
            :index="item.index"
            :is-visible="true"
            :is-loading="item.isLoading"
            :is-selected="isItemSelected(item)"
            :select-item="() => selectItem(item)"
            :deselect-item="() => deselectItem(item)"
          />
        </div>
      </div>
      
      <!-- Loading Indicators -->
      <div 
        v-if="showLoadingIndicators"
        class="loading-indicators"
      >
        <div 
          v-if="isLoadingTop"
          class="loading-indicator top"
        >
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <span class="loading-text">Loading...</span>
        </div>
        
        <div 
          v-if="isLoadingBottom"
          class="loading-indicator bottom"
        >
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <span class="loading-text">Loading...</span>
        </div>
      </div>
    </div>
    
    <!-- Scrollbar (Custom) -->
    <div 
      v-if="showCustomScrollbar"
      class="custom-scrollbar"
      :class="{ 'visible': isScrollbarVisible }"
    >
      <div 
        class="scrollbar-track"
        @mousedown="startScrollbarDrag"
      >
        <div 
          class="scrollbar-thumb"
          :style="scrollbarThumbStyle"
          @mousedown="startScrollbarDrag"
        ></div>
      </div>
    </div>
    
    <!-- Performance Monitor -->
    <div 
      v-if="showPerformanceMonitor"
      class="performance-monitor"
    >
      <div class="monitor-item">
        <span class="label">Items:</span>
        <span class="value">{{ visibleItems.length }}/{{ totalItems }}</span>
      </div>
      <div class="monitor-item">
        <span class="label">FPS:</span>
        <span class="value">{{ Math.round(currentFPS) }}</span>
      </div>
      <div class="monitor-item">
        <span class="label">Memory:</span>
        <span class="value">{{ formatMemoryUsage(memoryUsage) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// Props
const props = defineProps({
  // Data configuration
  items: {
    type: Array,
    default: () => []
  },
  itemHeight: {
    type: Number,
    default: 50
  },
  itemWidth: {
    type: String,
    default: '100%'
  },
  
  // Performance configuration
  bufferSize: {
    type: Number,
    default: 5 // Extra items to render above/below viewport
  },
  overscan: {
    type: Number,
    default: 2 // Items to render outside visible area
  },
  maxConcurrent: {
    type: Number,
    default: 10 // Maximum concurrent item renders
  },
  
  // Scrolling configuration
  smoothScrolling: {
    type: Boolean,
    default: true
  },
  scrollBehavior: {
    type: String,
    default: 'smooth' // auto, smooth
  },
  scrollRestoration: {
    type: Boolean,
    default: true
  },
  
  // UI configuration
  showLoadingIndicators: {
    type: Boolean,
    default: true
  },
  showCustomScrollbar: {
    type: Boolean,
    default: false
  },
  showPerformanceMonitor: {
    type: Boolean,
    default: false
  },
  
  // Selection configuration
  multiSelect: {
    type: Boolean,
    default: false
  },
  selectable: {
    type: Boolean,
    default: false
  },
  
  // Custom classes
  containerClass: {
    type: String,
    default: ''
  },
  itemClass: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'scroll',
  'scroll-end',
  'item-visible',
  'item-hidden',
  'item-selected',
  'item-deselected',
  'performance-update',
  'viewport-change'
])

// Reactive state
const virtualScroller = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(0)
const containerWidth = ref(0)
const isScrollbarVisible = ref(false)
const selectedItems = ref(new Set())
const isLoadingTop = ref(false)
const isLoadingBottom = ref(false)

// Performance monitoring
const currentFPS = ref(60)
const memoryUsage = ref(0)
const lastFrameTime = ref(0)
const frameCount = ref(0)
const lastFPSUpdate = ref(0)

// Scrollbar state
const isDraggingScrollbar = ref(false)
const scrollbarDragStart = ref(0)
const scrollbarDragStartTop = ref(0)

// Computed properties
const totalItems = computed(() => props.items.length)
const totalHeight = computed(() => totalItems.value * props.itemHeight)
const visibleCount = computed(() => Math.ceil(containerHeight.value / props.itemHeight) + (props.bufferSize * 2))

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, index - props.overscan)
})

const endIndex = computed(() => {
  const index = Math.floor((scrollTop.value + containerHeight.value) / props.itemHeight)
  return Math.min(totalItems.value - 1, index + props.overscan)
})

const visibleItems = computed(() => {
  const items = []
  for (let i = startIndex.value; i <= endIndex.value; i++) {
    if (i >= 0 && i < totalItems.value) {
      items.push({
        index: i,
        data: props.items[i],
        top: i * props.itemHeight,
        isLoading: false
      })
    }
  }
  return items
})

const scrollContainerStyle = computed(() => ({
  height: `${containerHeight.value}px`,
  width: props.itemWidth,
  overflow: 'hidden',
  position: 'relative'
}))

const visibleItemsStyle = computed(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  transform: `translateY(${startIndex.value * props.itemHeight}px)`
}))

const scrollbarThumbStyle = computed(() => {
  const thumbHeight = Math.max(20, (containerHeight.value / totalHeight.value) * containerHeight.value)
  const thumbTop = (scrollTop.value / totalHeight.value) * containerHeight.value
  
  return {
    height: `${thumbHeight}px`,
    top: `${thumbTop}px`
  }
})

// Methods
const handleScroll = (event) => {
  const target = event.target
  scrollTop.value = target.scrollTop
  
  // Emit scroll event
  emit('scroll', {
    scrollTop: scrollTop.value,
    scrollHeight: totalHeight.value,
    clientHeight: containerHeight.value,
    timestamp: Date.now()
  })
  
  // Check if scrolled to bottom
  if (scrollTop.value + containerHeight.value >= totalHeight.value - 10) {
    emit('scroll-end', {
      scrollTop: scrollTop.value,
      timestamp: Date.now()
    })
  }
  
  // Update viewport
  updateViewport()
}

const handleResize = () => {
  if (virtualScroller.value) {
    const rect = virtualScroller.value.getBoundingClientRect()
    containerHeight.value = rect.height
    containerWidth.value = rect.width
  }
}

const updateViewport = () => {
  emit('viewport-change', {
    startIndex: startIndex.value,
    endIndex: endIndex.value,
    visibleCount: visibleItems.value.length,
    scrollTop: scrollTop.value,
    timestamp: Date.now()
  })
  
  // Emit item visibility events
  visibleItems.value.forEach(item => {
    emit('item-visible', {
      index: item.index,
      data: item.data,
      timestamp: Date.now()
    })
  })
}

const scrollToIndex = (index, behavior = 'smooth') => {
  if (index < 0 || index >= totalItems.value) return
  
  const targetScrollTop = index * props.itemHeight
  const maxScrollTop = totalHeight.value - containerHeight.value
  
  const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop))
  
  if (virtualScroller.value) {
    virtualScroller.value.scrollTo({
      top: finalScrollTop,
      behavior: behavior === 'smooth' ? 'smooth' : 'auto'
    })
  }
}

const scrollToTop = (behavior = 'smooth') => {
  scrollToIndex(0, behavior)
}

const scrollToBottom = (behavior = 'smooth') => {
  scrollToIndex(totalItems.value - 1, behavior)
}

const getItemKey = (item, index) => {
  if (item.data && item.data.id) return item.data.id
  if (item.data && item.data.key) return item.data.key
  return `item-${index}`
}

const getItemClass = (item) => {
  const classes = ['virtual-item']
  
  if (props.itemClass) {
    classes.push(props.itemClass)
  }
  
  if (isItemSelected(item)) {
    classes.push('selected')
  }
  
  if (item.isLoading) {
    classes.push('loading')
  }
  
  return classes.join(' ')
}

const getItemStyle = (item) => ({
  height: `${props.itemHeight}px`,
  width: props.itemWidth,
  position: 'absolute',
  top: `${item.top}px`,
  left: 0,
  right: 0
})

const isItemSelected = (item) => {
  return selectedItems.value.has(item.index)
}

const selectItem = (item) => {
  if (!props.selectable) return
  
  if (props.multiSelect) {
    selectedItems.value.add(item.index)
  } else {
    selectedItems.value.clear()
    selectedItems.value.add(item.index)
  }
  
  emit('item-selected', {
    index: item.index,
    data: item.data,
    selectedItems: Array.from(selectedItems.value),
    timestamp: Date.now()
  })
}

const deselectItem = (item) => {
  if (!props.selectable) return
  
  selectedItems.value.delete(item.index)
  
  emit('item-deselected', {
    index: item.index,
    data: item.data,
    selectedItems: Array.from(selectedItems.value),
    timestamp: Date.now()
  })
}

const clearSelection = () => {
  selectedItems.value.clear()
}

const getSelectedItems = () => {
  return Array.from(selectedItems.value).map(index => ({
    index,
    data: props.items[index]
  }))
}

// Scrollbar handling
const startScrollbarDrag = (event) => {
  if (!props.showCustomScrollbar) return
  
  event.preventDefault()
  isDraggingScrollbar.value = true
  scrollbarDragStart.value = event.clientY
  scrollbarDragStartTop.value = scrollTop.value
  
  document.addEventListener('mousemove', handleScrollbarDrag)
  document.addEventListener('mouseup', stopScrollbarDrag)
}

const handleScrollbarDrag = (event) => {
  if (!isDraggingScrollbar.value) return
  
  const deltaY = event.clientY - scrollbarDragStart.value
  const scrollRatio = deltaY / containerHeight.value
  const newScrollTop = scrollbarDragStartTop.value + (scrollRatio * totalHeight.value)
  
  scrollToIndex(Math.floor(newScrollTop / props.itemHeight), 'auto')
}

const stopScrollbarDrag = () => {
  isDraggingScrollbar.value = false
  document.removeEventListener('mousemove', handleScrollbarDrag)
  document.removeEventListener('mouseup', stopScrollbarDrag)
}

// Performance monitoring
const updatePerformanceMetrics = () => {
  const now = performance.now()
  
  // FPS calculation
  if (lastFrameTime.value > 0) {
    const deltaTime = now - lastFrameTime.value
    frameCount.value++
    
    if (now - lastFPSUpdate.value >= 1000) {
      currentFPS.value = frameCount.value
      frameCount.value = 0
      lastFPSUpdate.value = now
      
      // Memory usage (if available)
      if (performance.memory) {
        memoryUsage.value = performance.memory.usedJSHeapSize
      }
      
      emit('performance-update', {
        fps: currentFPS.value,
        memoryUsage: memoryUsage.value,
        visibleItems: visibleItems.value.length,
        timestamp: Date.now()
      })
    }
  }
  
  lastFrameTime.value = now
  requestAnimationFrame(updatePerformanceMetrics)
}

const formatMemoryUsage = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  
  // Initialize container dimensions
  handleResize()
  
  // Setup scroll restoration
  if (props.scrollRestoration && window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual'
  }
  
  // Start performance monitoring
  if (props.showPerformanceMonitor) {
    requestAnimationFrame(updatePerformanceMetrics)
  }
  
  // Setup resize observer
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(handleResize)
    if (virtualScroller.value) {
      resizeObserver.observe(virtualScroller.value)
    }
  }
})

onUnmounted(() => {
  // Cleanup
  document.removeEventListener('mousemove', handleScrollbarDrag)
  document.removeEventListener('mouseup', stopScrollbarDrag)
})

// Expose methods
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  clearSelection,
  getSelectedItems,
  containerHeight: computed(() => containerHeight.value),
  totalItems: computed(() => totalItems.value),
  visibleItems: computed(() => visibleItems.value)
})
</script>

<style scoped>
.virtual-scroller {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.scroll-spacer {
  width: 100%;
  pointer-events: none;
}

.visible-items-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.virtual-item {
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
  contain: layout style paint;
}

.virtual-item.selected {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.virtual-item.loading {
  opacity: 0.7;
}

.loading-indicators {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.loading-indicator.top {
  top: 0;
  border-bottom: 1px solid #e5e7eb;
}

.loading-indicator.bottom {
  bottom: 0;
  border-top: 1px solid #e5e7eb;
}

.loading-spinner {
  margin-right: 0.5rem;
}

.spinner-ring {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.custom-scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.custom-scrollbar.visible {
  opacity: 1;
}

.scrollbar-track {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
}

.scrollbar-thumb {
  position: absolute;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  cursor: grab;
  transition: background-color 0.2s ease;
}

.scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.scrollbar-thumb:active {
  cursor: grabbing;
  background: rgba(0, 0, 0, 0.7);
}

.performance-monitor {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: monospace;
}

.monitor-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.monitor-item:last-child {
  margin-bottom: 0;
}

.monitor-item .label {
  margin-right: 0.5rem;
  opacity: 0.7;
}

.monitor-item .value {
  font-weight: bold;
}

/* Performance optimizations */
.virtual-scroller {
  contain: layout style paint;
}

.virtual-item {
  contain: layout style paint;
  will-change: transform;
}

/* Responsive design */
@media (max-width: 640px) {
  .custom-scrollbar {
    width: 6px;
  }
  
  .performance-monitor {
    font-size: 0.625rem;
    padding: 0.375rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .virtual-item.selected {
    background-color: rgba(59, 130, 246, 0.2);
    border-left: 3px solid #1d4ed8;
  }
  
  .custom-scrollbar .scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
  
  .custom-scrollbar .scrollbar-thumb {
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
