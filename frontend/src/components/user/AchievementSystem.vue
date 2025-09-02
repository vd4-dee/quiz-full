<template>
  <div class="achievement-system-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-1/4"></div>
        <div class="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="text-center py-12">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Achievements loading failed</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="loadAchievements" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Main achievements content -->
    <div v-else class="main-content">
      <!-- Header with overview -->
      <div class="achievements-header bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Achievement System</h1>
            <p class="text-gray-600">Track your progress and unlock new milestones</p>
          </div>
          
          <!-- Achievement stats -->
          <div class="flex items-center gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ earnedAchievements.length }}</div>
              <div class="text-sm text-gray-600">Earned</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-600">{{ totalAchievements.length }}</div>
              <div class="text-sm text-gray-600">Total</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ Math.round((earnedAchievements.length / totalAchievements.length) * 100) }}%</div>
              <div class="text-sm text-gray-600">Completion</div>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            :style="{ width: `${(earnedAchievements.length / totalAchievements.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Recent achievements celebration -->
      <div v-if="recentAchievements.length > 0" class="recent-achievements bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 mb-6 text-white">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">🎉</span>
          <h2 class="text-2xl font-bold">Recent Achievements!</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm"
          >
            <div class="flex items-center gap-3">
              <div class="text-3xl">{{ achievement.icon }}</div>
              <div>
                <h3 class="font-semibold">{{ achievement.title }}</h3>
                <p class="text-sm opacity-90">{{ achievement.description }}</p>
                <p class="text-xs opacity-75">Earned {{ formatTimeAgo(achievement.earnedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievement categories -->
      <div class="achievement-categories mb-6">
        <div class="flex items-center gap-2 mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Categories</h2>
          <div class="flex gap-2">
            <button
              v-for="category in categories"
              :key="category.value"
              @click="selectedCategory = category.value"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ category.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Achievement grid -->
      <div class="achievements-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          :class="[
            'achievement-card p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer',
            achievement.earned
              ? 'border-yellow-400 bg-yellow-50 hover:shadow-lg'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          ]"
          @click="showAchievementDetails(achievement)"
        >
          <!-- Achievement icon and status -->
          <div class="text-center mb-4">
            <div class="text-6xl mb-3">
              {{ achievement.earned ? achievement.icon : '🔒' }}
            </div>
            <div
              v-if="achievement.earned"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Unlocked
            </div>
            <div
              v-else
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            >
              Locked
            </div>
          </div>

          <!-- Achievement content -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ achievement.title }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ achievement.description }}</p>
            
            <!-- Progress indicator -->
            <div v-if="!achievement.earned" class="mb-4">
              <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{{ achievement.progress }} / {{ achievement.requirement }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- Reward info -->
            <div v-if="achievement.earned" class="text-sm">
              <div class="text-yellow-600 font-medium mb-1">Reward: {{ achievement.reward }}</div>
              <div class="text-gray-500">Earned {{ formatDate(achievement.earnedAt) }}</div>
            </div>
            <div v-else class="text-sm text-gray-500">
              <div class="font-medium mb-1">Reward: {{ achievement.reward }}</div>
              <div>{{ achievement.requirement }} to unlock</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredAchievements.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🏆</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No achievements found</h3>
        <p class="text-gray-600 mb-4">Try selecting a different category or check back later</p>
      </div>
    </div>

    <!-- Achievement Details Modal -->
    <div
      v-if="selectedAchievement"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeAchievementModal"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">Achievement Details</h2>
            <button
              @click="closeAchievementModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedAchievement" class="space-y-6">
            <!-- Achievement header -->
            <div class="text-center">
              <div class="text-8xl mb-4">
                {{ selectedAchievement.earned ? selectedAchievement.icon : '🔒' }}
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedAchievement.title }}</h3>
              <p class="text-gray-600">{{ selectedAchievement.description }}</p>
            </div>

            <!-- Achievement details -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Category</span>
                <div class="mt-1 text-lg font-semibold text-gray-900">{{ selectedAchievement.category }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Difficulty</span>
                <div class="mt-1 text-lg font-semibold text-gray-900">{{ selectedAchievement.difficulty }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Reward</span>
                <div class="mt-1 text-lg font-semibold text-gray-900">{{ selectedAchievement.reward }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Status</span>
                <div class="mt-1">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      selectedAchievement.earned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ selectedAchievement.earned ? 'Unlocked' : 'Locked' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Progress details -->
            <div v-if="!selectedAchievement.earned" class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-blue-900 mb-2">Progress to Unlock</h4>
              <div class="flex items-center justify-between text-sm text-blue-700 mb-2">
                <span>{{ selectedAchievement.progress }} / {{ selectedAchievement.requirement }}</span>
                <span>{{ Math.round((selectedAchievement.progress / selectedAchievement.requirement) * 100) }}%</span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-3">
                <div 
                  class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min((selectedAchievement.progress / selectedAchievement.requirement) * 100, 100)}%` }"
                ></div>
              </div>
              <p class="text-sm text-blue-700 mt-2">{{ selectedAchievement.hint }}</p>
            </div>

            <!-- Achievement history -->
            <div v-if="selectedAchievement.earned" class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-medium text-green-900 mb-2">Achievement History</h4>
              <div class="text-sm text-green-700">
                <p><strong>Unlocked:</strong> {{ formatDate(selectedAchievement.earnedAt) }}</p>
                <p><strong>Time to earn:</strong> {{ selectedAchievement.timeToEarn }}</p>
                <p v-if="selectedAchievement.rarity" class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ selectedAchievement.rarity }} Achievement
                  </span>
                </p>
              </div>
            </div>

            <!-- Related achievements -->
            <div v-if="relatedAchievements.length > 0" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Related Achievements</h4>
              <div class="flex gap-2">
                <button
                  v-for="related in relatedAchievements"
                  :key="related.id"
                  @click="showAchievementDetails(related)"
                  class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <span class="text-lg">{{ related.icon }}</span>
                  <span class="text-sm font-medium">{{ related.title }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

// Store
const userStore = useUserStore()

// Reactive state
const loading = ref(false)
const error = ref(null)
const selectedCategory = ref('all')
const selectedAchievement = ref(null)

// Achievement data
const achievements = ref([])
const recentAchievements = ref([])

// Categories
const categories = [
  { label: 'All', value: 'all' },
  { label: 'Learning', value: 'learning' },
  { label: 'Performance', value: 'performance' },
  { label: 'Social', value: 'social' },
  { label: 'Special', value: 'special' }
]

// Computed properties
const totalAchievements = computed(() => achievements.value)
const earnedAchievements = computed(() => achievements.value.filter(a => a.earned))

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(a => a.category === selectedCategory.value)
})

const relatedAchievements = computed(() => {
  if (!selectedAchievement.value) return []
  return achievements.value
    .filter(a => a.category === selectedAchievement.value.category && a.id !== selectedAchievement.value.id)
    .slice(0, 3)
})

// Methods
const loadAchievements = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Mock achievement data - replace with actual API call
    achievements.value = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        category: 'learning',
        difficulty: 'Beginner',
        requirement: 1,
        progress: 1,
        reward: '10 XP',
        earned: true,
        earnedAt: '2024-01-15T10:30:00Z',
        timeToEarn: '2 days',
        rarity: 'Common',
        hint: 'Take any quiz to get started!'
      },
      {
        id: '2',
        title: 'Quiz Master',
        description: 'Complete 10 quizzes',
        icon: '🏆',
        category: 'learning',
        difficulty: 'Intermediate',
        requirement: 10,
        progress: 7,
        reward: '50 XP + Quiz Master Badge',
        earned: false,
        hint: 'Keep taking quizzes to reach this milestone'
      },
      {
        id: '3',
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '⭐',
        category: 'performance',
        difficulty: 'Advanced',
        requirement: 1,
        progress: 0,
        reward: '100 XP + Perfect Score Badge',
        earned: false,
        hint: 'Study hard and aim for perfection!'
      },
      {
        id: '4',
        title: 'Speed Demon',
        description: 'Complete a quiz in under 5 minutes',
        icon: '⚡',
        category: 'performance',
        difficulty: 'Intermediate',
        requirement: 1,
        progress: 0,
        reward: '75 XP + Speed Badge',
        earned: false,
        hint: 'Answer quickly but accurately'
      },
      {
        id: '5',
        title: 'Study Streak',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        category: 'learning',
        difficulty: 'Advanced',
        requirement: 7,
        progress: 3,
        reward: '200 XP + Streak Badge',
        earned: false,
        hint: 'Visit the platform every day to maintain your streak'
      },
      {
        id: '6',
        title: 'Social Butterfly',
        description: 'Share 5 quiz results with friends',
        icon: '🦋',
        category: 'social',
        difficulty: 'Beginner',
        requirement: 5,
        progress: 2,
        reward: '25 XP + Social Badge',
        earned: false,
        hint: 'Share your quiz results on social media'
      }
    ]
    
    // Get recent achievements (earned in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    recentAchievements.value = achievements.value
      .filter(a => a.earned && new Date(a.earnedAt) > sevenDaysAgo)
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 3)
    
  } catch (err) {
    error.value = err.message || 'Failed to load achievements'
  } finally {
    loading.value = false
  }
}

const showAchievementDetails = (achievement) => {
  selectedAchievement.value = achievement
}

const closeAchievementModal = () => {
  selectedAchievement.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTimeAgo = (dateString) => {
  const now = new Date()
  const earned = new Date(dateString)
  const diffTime = Math.abs(now - earned)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// Lifecycle
onMounted(() => {
  loadAchievements()
})
</script>

<style scoped>
.achievement-system-container {
  @apply min-h-screen bg-gray-50 py-8;
}

.loading-container,
.error-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.main-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.achievement-card {
  @apply transform hover:scale-105;
}

.achievement-card.earned {
  @apply shadow-md;
}

.recent-achievements {
  @apply animate-bounce;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .achievements-header .flex {
    @apply flex-col gap-4;
  }
  
  .achievements-grid {
    @apply grid-cols-1;
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0,-8px,0);
  }
  70% {
    transform: translate3d(0,-4px,0);
  }
  90% {
    transform: translate3d(0,-2px,0);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
