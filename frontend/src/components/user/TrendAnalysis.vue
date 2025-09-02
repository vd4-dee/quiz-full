<template>
  <div>
    <div v-if="performanceData.length === 0" class="text-center py-8">
      <div class="text-gray-400">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-sm">No performance data available yet</p>
      </div>
    </div>
    
    <div v-else>
      <!-- Trend Chart -->
      <div class="relative h-64 mb-6">
        <div class="absolute inset-0 flex items-end justify-between">
          <div
            v-for="(dataPoint, index) in performanceData"
            :key="index"
            class="flex-1 mx-1 relative"
          >
            <div
              class="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
              :style="{ height: `${(dataPoint.score / 100) * 100}%` }"
              :title="`${dataPoint.date}: ${dataPoint.score}%`"
              @click="selectDataPoint(index)"
            ></div>
            
            <!-- Data Point Label -->
            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
              {{ dataPoint.date }}
            </div>
          </div>
        </div>
        
        <!-- Grid Lines -->
        <div class="absolute inset-0 flex flex-col justify-between">
          <div class="border-b border-gray-200"></div>
          <div class="border-b border-gray-200"></div>
          <div class="border-b border-gray-200"></div>
          <div class="border-b border-gray-200"></div>
        </div>
        
        <!-- Y-Axis Labels -->
        <div class="absolute inset-0 flex flex-col justify-between text-xs text-gray-400">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
      </div>
      
      <!-- Trend Analysis -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ trendDirection }}</div>
          <div class="text-sm text-blue-700">Trend</div>
        </div>
        
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ improvement }}</div>
          <div class="text-sm text-green-700">Improvement</div>
        </div>
        
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">{{ consistency }}</div>
          <div class="text-sm text-purple-700">Consistency</div>
        </div>
      </div>
      
      <!-- Trend Insights -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Trend Insights</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <div v-if="trendInsights.length > 0">
            <div
              v-for="(insight, index) in trendInsights"
              :key="index"
              class="flex items-start space-x-2"
            >
              <span class="text-blue-500 mt-1">•</span>
              <span>{{ insight }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500">
            Keep taking quizzes to see trend insights!
          </div>
        </div>
      </div>
      
      <!-- Performance Summary -->
      <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">Average Score:</span>
          <span class="ml-2 font-medium text-gray-900">{{ averageScore }}%</span>
        </div>
        <div>
          <span class="text-gray-500">Best Score:</span>
          <span class="ml-2 font-medium text-gray-900">{{ bestScore }}%</span>
        </div>
        <div>
          <span class="text-gray-500">Lowest Score:</span>
          <span class="ml-2 font-medium text-gray-900">{{ lowestScore }}%</span>
        </div>
        <div>
          <span class="text-gray-500">Score Range:</span>
          <span class="ml-2 font-medium text-gray-900">{{ scoreRange }}%</span>
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

const lowestScore = computed(() => {
  if (props.performanceData.length === 0) return 0
  
  return Math.min(...props.performanceData.map(data => data.score))
})

const scoreRange = computed(() => {
  return bestScore.value - lowestScore.value
})

const trendDirection = computed(() => {
  if (props.performanceData.length < 2) return 'N/A'
  
  const firstHalf = props.performanceData.slice(0, Math.ceil(props.performanceData.length / 2))
  const secondHalf = props.performanceData.slice(Math.ceil(props.performanceData.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, data) => sum + data.score, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, data) => sum + data.score, 0) / secondHalf.length
  
  const difference = secondAvg - firstAvg
  
  if (difference > 5) return '↗️ Improving'
  if (difference < -5) return '↘️ Declining'
  return '→ Stable'
})

const improvement = computed(() => {
  if (props.performanceData.length < 2) return 'N/A'
  
  const firstScore = props.performanceData[0].score
  const lastScore = props.performanceData[props.performanceData.length - 1].score
  
  const improvement = lastScore - firstScore
  
  if (improvement > 0) return `+${improvement}%`
  if (improvement < 0) return `${improvement}%`
  return '0%'
})

const consistency = computed(() => {
  if (props.performanceData.length < 2) return 'N/A'
  
  const scores = props.performanceData.map(data => data.score)
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  
  if (standardDeviation <= 10) return 'High'
  if (standardDeviation <= 20) return 'Medium'
  return 'Low'
})

const trendInsights = computed(() => {
  const insights = []
  
  if (props.performanceData.length >= 3) {
    const recentScores = props.performanceData.slice(-3)
    const recentAvg = recentScores.reduce((sum, data) => sum + data.score, 0) / recentScores.length
    
    if (recentAvg > averageScore.value + 5) {
      insights.push('Your recent performance is above your average - great job!')
    } else if (recentAvg < averageScore.value - 5) {
      insights.push('Your recent performance is below your average - consider reviewing the material.')
    }
    
    if (bestScore.value >= 90) {
      insights.push('You\'ve achieved excellent scores - you\'re mastering this subject!')
    }
    
    if (scoreRange.value > 30) {
      insights.push('Your scores vary significantly - focus on consistent study habits.')
    }
  }
  
  return insights
})

// Methods
const selectDataPoint = (index) => {
  // This could be used to show detailed information about a specific quiz
  console.log('Selected data point:', props.performanceData[index])
}
</script>
