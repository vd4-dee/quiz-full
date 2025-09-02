<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Data Export System</h3>
        <p class="text-sm text-gray-600">Export analytics data in various formats and schedule automated reports</p>
      </div>
      <div class="flex items-center space-x-3">
        <button 
          @click="showExportModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          New Export
        </button>
        <button 
          @click="showScheduleModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          Schedule Export
        </button>
      </div>
    </div>

    <!-- Export History -->
    <div class="mb-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Recent Exports</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Export Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="exportItem in exportHistory" :key="exportItem.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ exportItem.name }}</div>
                  <div class="text-sm text-gray-500">{{ exportItem.description }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getTypeClass(exportItem.type)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ exportItem.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ exportItem.format }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(exportItem.status)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ exportItem.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ exportItem.created }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  v-if="exportItem.status === 'Completed'"
                  @click="downloadExport(exportItem)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Download
                </button>
                <button 
                  v-if="exportItem.status === 'Failed'"
                  @click="retryExport(exportItem)"
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  Retry
                </button>
                <button 
                  @click="deleteExport(exportItem)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Scheduled Exports -->
    <div class="mb-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Scheduled Exports</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="schedule in scheduledExports" 
          :key="schedule.id"
          class="bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <div class="flex items-center justify-between mb-3">
            <h5 class="text-sm font-medium text-gray-900">{{ schedule.name }}</h5>
            <span 
              :class="getScheduleStatusClass(schedule.status)"
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
            >
              {{ schedule.status }}
            </span>
          </div>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center">
              <ClockIcon class="w-4 h-4 mr-2" />
              <span>{{ schedule.frequency }}</span>
            </div>
            <div class="flex items-center">
              <CalendarIcon class="w-4 h-4 mr-2" />
              <span>Next: {{ schedule.nextRun }}</span>
            </div>
            <div class="flex items-center">
              <DocumentIcon class="w-4 h-4 mr-2" />
              <span>{{ schedule.format }}</span>
            </div>
          </div>
          <div class="mt-3 flex space-x-2">
            <button 
              @click="editSchedule(schedule)"
              class="text-blue-600 hover:text-blue-900 text-xs"
            >
              Edit
            </button>
            <button 
              @click="toggleSchedule(schedule)"
              :class="schedule.status === 'Active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
              class="text-xs"
            >
              {{ schedule.status === 'Active' ? 'Pause' : 'Activate' }}
            </button>
            <button 
              @click="deleteSchedule(schedule)"
              class="text-red-600 hover:text-red-900 text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Templates -->
    <div>
      <h4 class="text-md font-semibold text-gray-900 mb-4">Export Templates</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="template in exportTemplates" 
          :key="template.id"
          class="bg-blue-50 p-4 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          @click="useTemplate(template)"
        >
          <div class="flex items-center justify-between mb-2">
            <h5 class="text-sm font-medium text-blue-900">{{ template.name }}</h5>
            <DocumentIcon class="w-5 h-5 text-blue-600" />
          </div>
          <p class="text-sm text-blue-700 mb-3">{{ template.description }}</p>
          <div class="flex items-center text-xs text-blue-600">
            <span class="mr-2">{{ template.dataTypes.join(', ') }}</span>
            <span>{{ template.format }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Export</h3>
          
          <div class="space-y-4">
            <!-- Basic Information -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Export Name</label>
              <input 
                v-model="newExport.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter export name"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                v-model="newExport.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter export description"
              ></textarea>
            </div>

            <!-- Data Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Types</label>
              <div class="grid grid-cols-2 gap-2">
                <label v-for="dataType in availableDataTypes" :key="dataType.value" class="flex items-center">
                  <input 
                    v-model="newExport.dataTypes"
                    type="checkbox"
                    :value="dataType.value"
                    class="mr-2"
                  />
                  <span class="text-sm">{{ dataType.label }}</span>
                </label>
              </div>
            </div>

            <!-- Export Options -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select 
                  v-model="newExport.format"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select 
                  v-model="newExport.dateRange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
            </div>

            <!-- Advanced Options -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Advanced Options</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input 
                    v-model="newExport.includeMetadata"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">Include metadata and timestamps</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="newExport.compressFile"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">Compress file (ZIP)</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="newExport.scheduleExport"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">Schedule recurring export</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="showExportModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="createExport"
              :disabled="isCreating"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <span v-if="isCreating">Creating...</span>
              <span v-else>Create Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div v-if="showScheduleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Schedule Export</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Export Template</label>
              <select 
                v-model="newSchedule.exportId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an export template</option>
                <option v-for="exportItem in exportHistory" :key="exportItem.id" :value="exportItem.id">
                  {{ exportItem.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select 
                v-model="newSchedule.frequency"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div v-if="newSchedule.frequency === 'custom'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
              <input 
                v-model="newSchedule.cronExpression"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0 0 * * * (daily at midnight)"
              />
              <p class="text-xs text-gray-500 mt-1">Use cron syntax for custom scheduling</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input 
                v-model="newSchedule.startDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
              <input 
                v-model="newSchedule.endDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Notification</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input 
                    v-model="newSchedule.emailNotification"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">Send email notification</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="newSchedule.webhookNotification"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">Send webhook notification</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="showScheduleModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="createSchedule"
              :disabled="isCreatingSchedule"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <span v-if="isCreatingSchedule">Creating...</span>
              <span v-else>Create Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  ClockIcon,
  CalendarIcon,
  DocumentIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  analyticsData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['export-created', 'schedule-created', 'export-downloaded'])

// Reactive state
const showExportModal = ref(false)
const showScheduleModal = ref(false)
const isCreating = ref(false)
const isCreatingSchedule = ref(false)

// New export form
const newExport = reactive({
  name: '',
  description: '',
  dataTypes: [],
  format: 'csv',
  dateRange: '30d',
  includeMetadata: true,
  compressFile: false,
  scheduleExport: false
})

// New schedule form
const newSchedule = reactive({
  exportId: '',
  frequency: 'daily',
  cronExpression: '',
  startDate: '',
  endDate: '',
  emailNotification: true,
  webhookNotification: false
})

// Available data types
const availableDataTypes = [
  { value: 'user_engagement', label: 'User Engagement' },
  { value: 'quiz_performance', label: 'Quiz Performance' },
  { value: 'question_analytics', label: 'Question Analytics' },
  { value: 'system_metrics', label: 'System Metrics' },
  { value: 'error_logs', label: 'Error Logs' },
  { value: 'audit_trails', label: 'Audit Trails' }
]

// Sample data - replace with actual API calls
const exportHistory = reactive([
  {
    id: 1,
    name: 'Weekly Performance Report',
    description: 'Comprehensive weekly analytics report',
    type: 'Scheduled',
    format: 'PDF',
    status: 'Completed',
    created: '2 hours ago'
  },
  {
    id: 2,
    name: 'User Engagement Data',
    description: 'Daily user activity metrics',
    type: 'Manual',
    format: 'CSV',
    status: 'Completed',
    created: '1 day ago'
  },
  {
    id: 3,
    name: 'Question Bank Export',
    description: 'Complete question database',
    type: 'Manual',
    format: 'XLSX',
    status: 'Failed',
    created: '3 days ago'
  }
])

const scheduledExports = reactive([
  {
    id: 1,
    name: 'Daily Analytics',
    status: 'Active',
    frequency: 'Daily',
    nextRun: 'Tomorrow 00:00',
    format: 'PDF'
  },
  {
    id: 2,
    name: 'Weekly Summary',
    status: 'Active',
    frequency: 'Weekly',
    nextRun: 'Next Monday 00:00',
    format: 'XLSX'
  },
  {
    id: 3,
    name: 'Monthly Report',
    status: 'Paused',
    frequency: 'Monthly',
    nextRun: 'Next month 1st',
    format: 'PDF'
  }
])

const exportTemplates = reactive([
  {
    id: 1,
    name: 'Performance Summary',
    description: 'Key performance indicators and metrics',
    dataTypes: ['quiz_performance', 'user_engagement'],
    format: 'PDF'
  },
  {
    id: 2,
    name: 'Data Export',
    description: 'Raw data for external analysis',
    dataTypes: ['user_engagement', 'question_analytics', 'system_metrics'],
    format: 'CSV'
  },
  {
    id: 3,
    name: 'Executive Report',
    description: 'High-level insights and recommendations',
    dataTypes: ['quiz_performance', 'user_engagement'],
    format: 'PDF'
  }
])

// Methods
const createExport = async () => {
  if (!newExport.name || newExport.dataTypes.length === 0) {
    alert('Please fill in all required fields')
    return
  }

  isCreating.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const exportItem = {
      id: Date.now(),
      ...newExport,
      type: 'Manual',
      status: 'In Progress',
      created: 'Just now'
    }
    
    exportHistory.unshift(exportItem)
    
    // Reset form
    Object.assign(newExport, {
      name: '',
      description: '',
      dataTypes: [],
      format: 'csv',
      dateRange: '30d',
      includeMetadata: true,
      compressFile: false,
      scheduleExport: false
    })
    
    showExportModal.value = false
    emit('export-created', exportItem)
    
    // Simulate completion
    setTimeout(() => {
      exportItem.status = 'Completed'
    }, 3000)
    
  } catch (error) {
    console.error('Error creating export:', error)
  } finally {
    isCreating.value = false
  }
}

const createSchedule = async () => {
  if (!newSchedule.exportId || !newSchedule.startDate) {
    alert('Please fill in all required fields')
    return
  }

  isCreatingSchedule.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const schedule = {
      id: Date.now(),
      ...newSchedule,
      status: 'Active',
      nextRun: 'Tomorrow 00:00'
    }
    
    scheduledExports.push(schedule)
    
    // Reset form
    Object.assign(newSchedule, {
      exportId: '',
      frequency: 'daily',
      cronExpression: '',
      startDate: '',
      endDate: '',
      emailNotification: true,
      webhookNotification: false
    })
    
    showScheduleModal.value = false
    emit('schedule-created', schedule)
    
  } catch (error) {
    console.error('Error creating schedule:', error)
  } finally {
    isCreatingSchedule.value = false
  }
}

const downloadExport = (exportItem) => {
  // Simulate download
  console.log('Downloading export:', exportItem.name)
  emit('export-downloaded', exportItem)
}

const retryExport = (exportItem) => {
  exportItem.status = 'In Progress'
  // Simulate retry
  setTimeout(() => {
    exportItem.status = 'Completed'
  }, 2000)
}

const deleteExport = (exportItem) => {
  const index = exportHistory.findIndex(item => item.id === exportItem.id)
  if (index > -1) {
    exportHistory.splice(index, 1)
  }
}

const editSchedule = (schedule) => {
  // Populate form with schedule data
  Object.assign(newSchedule, schedule)
  showScheduleModal.value = true
}

const toggleSchedule = (schedule) => {
  schedule.status = schedule.status === 'Active' ? 'Paused' : 'Active'
}

const deleteSchedule = (schedule) => {
  const index = scheduledExports.findIndex(item => item.id === schedule.id)
  if (index > -1) {
    scheduledExports.splice(index, 1)
  }
}

const useTemplate = (template) => {
  // Populate export form with template data
  newExport.name = template.name
  newExport.description = template.description
  newExport.dataTypes = [...template.dataTypes]
  newExport.format = template.format
  showExportModal.value = true
}

const getTypeClass = (type) => {
  const classes = {
    'Scheduled': 'bg-blue-100 text-blue-800',
    'Manual': 'bg-gray-100 text-gray-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status) => {
  const classes = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Failed': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getScheduleStatusClass = (status) => {
  const classes = {
    'Active': 'bg-green-100 text-green-800',
    'Paused': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Lifecycle
onMounted(() => {
  // Set default start date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  newSchedule.startDate = tomorrow.toISOString().split('T')[0]
})
</script>

<style scoped>
/* Custom styles */
.modal-overlay {
  backdrop-filter: blur(4px);
}
</style>
