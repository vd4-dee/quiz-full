<template>
  <div class="user-profile-container">
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
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Profile loading failed</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="loadProfile" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Main profile content -->
    <div v-else class="main-content">
      <!-- Profile header -->
      <div class="profile-header bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div class="flex items-start gap-6">
          <!-- Avatar section -->
          <div class="avatar-section">
            <div class="relative">
              <img
                v-if="profile.avatar"
                :src="profile.avatar"
                :alt="profile.displayName"
                class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div
                v-else
                class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg"
              >
                {{ profile.displayName?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              
              <!-- Avatar upload button -->
              <button
                @click="triggerAvatarUpload"
                class="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Change avatar"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <!-- Hidden file input -->
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarChange"
              />
            </div>
          </div>

          <!-- Profile info -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ profile.displayName }}</h1>
                <p class="text-lg text-gray-600 mb-2">{{ profile.email }}</p>
                <p class="text-gray-500">{{ profile.bio || 'No bio added yet' }}</p>
              </div>
              
              <button
                @click="editMode = !editMode"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  editMode 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                ]"
              >
                {{ editMode ? 'Cancel Edit' : 'Edit Profile' }}
              </button>
            </div>

            <!-- Quick stats -->
            <div class="grid grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ stats.totalQuizzes }}</div>
                <div class="text-sm text-gray-600">Quizzes Taken</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ stats.averageScore }}%</div>
                <div class="text-sm text-gray-600">Average Score</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ stats.achievements }}</div>
                <div class="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile tabs -->
      <div class="profile-tabs bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Tab navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab content -->
        <div class="p-6">
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'personal'" class="tab-content">
            <div v-if="editMode" class="edit-form space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    v-model="editForm.displayName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter display name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    v-model="editForm.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    v-model="editForm.bio"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button
                  @click="saveProfile"
                  :disabled="saving"
                  class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
                <button
                  @click="cancelEdit"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div v-else class="view-mode space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-1">Display Name</h3>
                  <p class="text-gray-900">{{ profile.displayName }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p class="text-gray-900">{{ profile.email }}</p>
                </div>
                <div class="md:col-span-2">
                  <h3 class="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                  <p class="text-gray-900">{{ profile.bio || 'No bio added yet' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Learning Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="tab-content">
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Difficulty Preferences</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    v-for="level in difficultyLevels"
                    :key="level.value"
                    class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      :value="level.value"
                      v-model="preferences.difficulties"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-3 text-sm font-medium text-gray-700">{{ level.label }}</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Topic Interests</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label
                    v-for="topic in availableTopics"
                    :key="topic.value"
                    class="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      :value="topic.value"
                      v-model="preferences.topics"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ topic.label }}</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Study Goals</h3>
                <div class="space-y-3">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="preferences.goals.dailyPractice"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-gray-700">Daily practice (at least 15 minutes)</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="preferences.goals.weeklyQuizzes"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-gray-700">Complete 3 quizzes per week</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="preferences.goals.improveScore"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-gray-700">Improve average score by 10%</span>
                  </label>
                </div>
              </div>

              <button
                @click="savePreferences"
                :disabled="savingPreferences"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {{ savingPreferences ? 'Saving...' : 'Save Preferences' }}
              </button>
            </div>
          </div>

          <!-- Achievements Tab -->
          <div v-if="activeTab === 'achievements'" class="tab-content">
            <div class="space-y-6">
              <div class="text-center mb-8">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Your Achievements</h3>
                <p class="text-gray-600">Track your progress and celebrate milestones</p>
              </div>

              <!-- Achievement grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="achievement in achievements"
                  :key="achievement.id"
                  :class="[
                    'achievement-card p-6 rounded-lg border-2 transition-all duration-200',
                    achievement.earned
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  ]"
                >
                  <div class="text-center">
                    <div class="text-4xl mb-3">
                      {{ achievement.earned ? achievement.icon : '🔒' }}
                    </div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ achievement.title }}</h4>
                    <p class="text-sm text-gray-600 mb-3">{{ achievement.description }}</p>
                    <div class="text-xs text-gray-500">
                      {{ achievement.earned ? `Earned on ${achievement.earnedDate}` : achievement.requirement }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quiz History Tab -->
          <div v-if="activeTab === 'history'" class="tab-content">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Quiz History</h3>
                <div class="flex gap-2">
                  <select
                    v-model="historyFilter.status"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                  <select
                    v-model="historyFilter.sortBy"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="score">Highest Score</option>
                    <option value="duration">Shortest Time</option>
                  </select>
                </div>
              </div>

              <!-- History table -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="quiz in filteredHistory" :key="quiz.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ quiz.title }}</div>
                        <div class="text-sm text-gray-500">{{ quiz.category }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-900">{{ quiz.score }}%</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ formatDuration(quiz.timeSpent) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ formatDate(quiz.completedAt) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          :class="[
                            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                            quiz.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          ]"
                        >
                          {{ quiz.status === 'completed' ? 'Completed' : 'In Progress' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'

// Store
const userStore = useUserStore()

// Reactive state
const loading = ref(false)
const error = ref(null)
const editMode = ref(false)
const activeTab = ref('personal')
const saving = ref(false)
const savingPreferences = ref(false)
const avatarInput = ref(null)

// Profile data
const profile = ref({
  displayName: '',
  email: '',
  bio: '',
  avatar: null
})

const editForm = ref({
  displayName: '',
  email: '',
  bio: ''
})

// Stats
const stats = ref({
  totalQuizzes: 0,
  averageScore: 0,
  achievements: 0
})

// Preferences
const preferences = ref({
  difficulties: [],
  topics: [],
  goals: {
    dailyPractice: false,
    weeklyQuizzes: false,
    improveScore: false
  }
})

// History filter
const historyFilter = ref({
  status: '',
  sortBy: 'recent'
})

// Tab configuration
const tabs = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'preferences', label: 'Learning Preferences' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'history', label: 'Quiz History' }
]

// Available options
const difficultyLevels = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' }
]

const availableTopics = [
  { label: 'Mathematics', value: 'mathematics' },
  { label: 'Science', value: 'science' },
  { label: 'History', value: 'history' },
  { label: 'Literature', value: 'literature' },
  { label: 'Technology', value: 'technology' },
  { label: 'Languages', value: 'languages' },
  { label: 'Arts', value: 'arts' },
  { label: 'Sports', value: 'sports' }
]

// Mock achievements
const achievements = ref([
  {
    id: '1',
    title: 'First Quiz',
    description: 'Complete your first quiz',
    icon: '🎯',
    earned: true,
    earnedDate: '2024-01-15',
    requirement: 'Complete 1 quiz'
  },
  {
    id: '2',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '🏆',
    earned: false,
    requirement: 'Complete 10 quizzes'
  },
  {
    id: '3',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: '⭐',
    earned: false,
    requirement: 'Score 100% on any quiz'
  }
])

// Mock quiz history
const quizHistory = ref([
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    category: 'Technology',
    score: 85,
    timeSpent: 1200,
    completedAt: '2024-01-20T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    title: 'World History',
    category: 'History',
    score: 92,
    timeSpent: 1800,
    completedAt: '2024-01-18T14:15:00Z',
    status: 'completed'
  }
])

// Computed properties
const filteredHistory = computed(() => {
  let filtered = [...quizHistory.value]
  
  if (historyFilter.value.status) {
    filtered = filtered.filter(quiz => quiz.status === historyFilter.value.status)
  }
  
  filtered.sort((a, b) => {
    switch (historyFilter.value.sortBy) {
      case 'recent':
        return new Date(b.completedAt) - new Date(a.completedAt)
      case 'score':
        return b.score - a.score
      case 'duration':
        return a.timeSpent - b.timeSpent
      default:
        return 0
    }
  })
  
  return filtered
})

// Methods
const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Mock data - replace with actual API call
    profile.value = {
      displayName: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'Passionate learner and quiz enthusiast',
      avatar: null
    }
    
    stats.value = {
      totalQuizzes: 15,
      averageScore: 78,
      achievements: 3
    }
    
    preferences.value = {
      difficulties: ['beginner', 'intermediate'],
      topics: ['technology', 'science'],
      goals: {
        dailyPractice: true,
        weeklyQuizzes: false,
        improveScore: true
      }
    }
    
    // Initialize edit form
    editForm.value = { ...profile.value }
    
  } catch (err) {
    error.value = err.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    // Mock avatar upload - replace with actual API call
    const reader = new FileReader()
    reader.onload = (e) => {
      profile.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
    
    // Save to store
    await userStore.updateAvatar(profile.value.avatar)
    
  } catch (err) {
    error.value = 'Failed to upload avatar'
  }
}

const saveProfile = async () => {
  try {
    saving.value = true
    
    // Update profile
    Object.assign(profile.value, editForm.value)
    
    // Save to store
    await userStore.updateProfile(profile.value)
    
    editMode.value = false
    
  } catch (err) {
    error.value = 'Failed to save profile'
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  editForm.value = { ...profile.value }
  editMode.value = false
}

const savePreferences = async () => {
  try {
    savingPreferences.value = true
    
    // Save to store
    await userStore.updatePreferences(preferences.value)
    
  } catch (err) {
    error.value = 'Failed to save preferences'
  } finally {
    savingPreferences.value = false
  }
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadProfile()
})

// Watch for tab changes
watch(activeTab, (newTab) => {
  // Could load tab-specific data here
})
</script>

<style scoped>
.user-profile-container {
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-header .flex {
    @apply flex-col text-center;
  }
  
  .profile-header .grid {
    @apply grid-cols-1;
  }
}
</style>
