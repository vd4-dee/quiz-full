<template>
  <div class="flex items-center space-x-2">
    <!-- Timer Display -->
    <div
      class="text-lg font-mono font-bold px-3 py-1 rounded-md transition-all duration-300"
      :class="timerClasses"
    >
      {{ formattedTime }}
    </div>
    
    <!-- Warning Icon -->
    <div v-if="showWarning" class="flex items-center">
      <svg class="h-5 w-5 text-yellow-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    
    <!-- Critical Warning Icon -->
    <div v-if="showCriticalWarning" class="flex items-center">
      <svg class="h-5 w-5 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  timeRemaining: {
    type: Number,
    default: 0
  }
})

// Computed properties
const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60)
  const seconds = props.timeRemaining % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const showWarning = computed(() => {
  // Show warning when 10 minutes or less remain
  return props.timeRemaining <= 600 && props.timeRemaining > 120
})

const showCriticalWarning = computed(() => {
  // Show critical warning when 2 minutes or less remain
  return props.timeRemaining <= 120
})

const timerClasses = computed(() => {
  if (props.timeRemaining <= 120) {
    // Critical: red background
    return 'bg-red-100 text-red-800 border border-red-300'
  } else if (props.timeRemaining <= 600) {
    // Warning: yellow background
    return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
  } else {
    // Normal: blue background
    return 'bg-blue-100 text-blue-800 border border-blue-300'
  }
})
</script>
