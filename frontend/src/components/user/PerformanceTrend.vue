<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <h3 class="text-sm font-medium text-gray-500 mb-3">Performance Trend</h3>
    
    <div v-if="performanceData.length === 0" class="text-center py-4">
      <div class="text-gray-400">
        <svg class="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-sm">No performance data yet</p>
      </div>
    </div>
    
    <div v-else>
      <!-- Simple Chart -->
      <div class="relative h-32 mb-3">
        <div class="absolute inset-0 flex items-end justify-between">
          <div
            v-for="(dataPoint, index) in performanceData"
            :key="index"
            class="flex-1 mx-1 relative"
          >
            <div
              class="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
              :style="{ height: `${(dataPoint.score / 100) * 100}%` }"
              :title="`${dataPoint.date}: ${dataPoint.score}%`"
            ></div>
          </div>
        </div>
        
        <!-- Grid Lines -->
        <div class="absolute inset-0 flex flex-col justify-between">
          <div class="border-b border-gray-200"></div>
          <div class="border-b border-gray-200"></div>
          <div class="border-b border-gray-200"></div>
          <div class="border-b border-gray-200"></div>
        </div>
      </div>
      
      <!-- Chart Labels -->
      <div class="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
      
      <!-- Performance Summary -->
      <div class="mt-4 pt-3 border-t border-gray-100">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-lg font-semibold text-green-600">
              {{ averageScore }}%
            </div>
            <div class="text-xs text-gray-500">Average</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-blue-600">
              {{ bestScore }}%
            </div>
            <div class="text-xs text-gray-500">Best</div>
          </div>
        </div>
        
        <!-- Trend Indicator -->
        <div class="mt-3 flex items-center justify-center">
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="trendIndicatorClasses"
          >
            <svg v-if="trendDirection === 'up'" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <svg v-else-if="trendDirection === 'down'" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <svg v-else class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
            </svg>
            {{ trendText }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  performanceData: {
    type: Array,
    default: () => []
  }
})

// Computed properties
const averageScore = computed(() => {
  if (props.performanceData.length === 0) return 0
  
  const total = props.performanceData.reduce((sum, data) => sum + data.score, 0)
  return Math.round(total / props.performanceData.length)
})

const bestScore = computed(() => {
  if (props.performanceData.length === 0) return 0
  
  return Math.max(...props.performanceData.map(data => data.score))
})

const trendDirection = computed(() => {
  if (props.performanceData.length < 2) return 'stable'
  
  const recentScores = props.performanceData.slice(-3)
  const firstHalf = recentScores.slice(0, Math.ceil(recentScores.length / 2))
  const secondHalf = recentScores.slice(Math.ceil(recentScores.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, data) => sum + data.score, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, data) => sum + data.score, 0) / secondHalf.length
  
  const difference = secondAvg - firstAvg
  
  if (difference > 5) return 'up'
  if (difference < -5) return 'down'
  return 'stable'
})

const trendText = computed(() => {
  const textMap = {
    'up': 'Improving',
    'down': 'Declining',
    'stable': 'Stable'
  }
  return textMap[trendDirection.value]
})

const trendIndicatorClasses = computed(() => {
  const classMap = {
    'up': 'bg-green-100 text-green-800',
    'down': 'bg-red-100 text-red-800',
    'stable': 'bg-gray-100 text-gray-800'
  }
  return classMap[trendDirection.value]
})
</script>
