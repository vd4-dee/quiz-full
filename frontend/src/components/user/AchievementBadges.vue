<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <h3 class="text-sm font-medium text-gray-500 mb-3">Achievements</h3>
    
    <div v-if="badges.length === 0" class="text-center py-4">
      <div class="text-gray-400">
        <svg class="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <p class="text-sm">No achievements yet</p>
      </div>
    </div>
    
    <div v-else class="space-y-3">
      <div
        v-for="badge in badges"
        :key="badge.id"
        class="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200"
        :class="badge.unlocked ? 'bg-blue-50' : 'bg-gray-50'"
      >
        <!-- Badge Icon -->
        <div class="flex-shrink-0">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
            :class="badge.unlocked ? 'bg-blue-100' : 'bg-gray-200'"
          >
            {{ badge.icon }}
          </div>
        </div>
        
        <!-- Badge Content -->
        <div class="flex-1 min-w-0">
          <div
            class="text-sm font-medium"
            :class="badge.unlocked ? 'text-blue-900' : 'text-gray-500'"
          >
            {{ badge.name }}
          </div>
          <div
            class="text-xs"
            :class="badge.unlocked ? 'text-blue-700' : 'text-gray-400'"
          >
            {{ badge.description }}
          </div>
        </div>
        
        <!-- Unlock Status -->
        <div class="flex-shrink-0">
          <div
            v-if="badge.unlocked"
            class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div
            v-else
            class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Progress Summary -->
    <div v-if="badges.length > 0" class="mt-4 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Progress</span>
        <span class="text-sm font-medium text-gray-900">
          {{ unlockedCount }}/{{ badges.length }}
        </span>
      </div>
      
      <!-- Progress Bar -->
      <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(unlockedCount / badges.length) * 100}%` }"
        ></div>
      </div>
      
      <!-- Next Achievement Hint -->
      <div v-if="nextAchievement" class="mt-2 text-xs text-gray-500 text-center">
        Next: {{ nextAchievement.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  badges: {
    type: Array,
    default: () => []
  }
})

// Computed properties
const unlockedCount = computed(() => {
  return props.badges.filter(badge => badge.unlocked).length
})

const nextAchievement = computed(() => {
  const lockedBadges = props.badges.filter(badge => !badge.unlocked)
  return lockedBadges.length > 0 ? lockedBadges[0] : null
})
</script>
