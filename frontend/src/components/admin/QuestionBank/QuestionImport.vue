<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Import/Export Questions</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Import questions from Excel/CSV files or export existing questions
      </p>
    </div>

    <!-- Import Section -->
    <div class="mb-8">
      <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">Import Questions</h4>
      
      <!-- File Upload -->
      <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <div class="space-y-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          
          <div>
            <label for="file-upload" class="cursor-pointer">
              <span class="text-blue-600 hover:text-blue-500 font-medium">Upload a file</span>
              <span class="text-gray-500 dark:text-gray-400"> or drag and drop</span>
            </label>
            <input
              id="file-upload"
              ref="fileInput"
              type="file"
              accept=".csv,.xlsx,.xls"
              @change="handleFileSelect"
              class="sr-only"
            />
          </div>
          
          <p class="text-xs text-gray-500 dark:text-gray-400">
            CSV, XLSX, or XLS up to 10MB
          </p>
        </div>
      </div>

      <!-- File Info -->
      <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatFileSize(selectedFile.size) }} • {{ selectedFile.type || 'Unknown type' }}
              </p>
            </div>
          </div>
          <button
            @click="removeFile"
            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Import Options -->
      <div v-if="selectedFile" class="mt-6 space-y-4">
        <h5 class="text-sm font-medium text-gray-900 dark:text-white">Import Options</h5>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duplicate Handling
            </label>
            <select
              v-model="importOptions.duplicateHandling"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="skip">Skip duplicates</option>
              <option value="update">Update existing</option>
              <option value="create_new">Create new versions</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Category
            </label>
            <select
              v-model="importOptions.defaultCategory"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Use from file</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="literature">Literature</option>
              <option value="geography">Geography</option>
              <option value="computer_science">Computer Science</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Level
            </label>
            <select
              v-model="importOptions.defaultLevel"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Use from file</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Points
            </label>
            <input
              v-model="importOptions.defaultPoints"
              type="number"
              min="1"
              max="100"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="1"
            />
          </div>
        </div>

        <!-- Preview -->
        <div v-if="previewData.length > 0" class="mt-6">
          <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Preview ({{ previewData.length }} questions)
          </h5>
          <div class="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Question
                  </th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Category
                  </th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(item, index) in previewData.slice(0, 10)"
                  :key="index"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td class="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {{ item.question || 'No question text' }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ item.type || 'Unknown' }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ item.category || 'Default' }}
                  </td>
                  <td class="px-3 py-2">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusClass(item.status)
                      ]"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="previewData.length > 10" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Showing first 10 questions. Total: {{ previewData.length }}
          </p>
        </div>

        <!-- Import Button -->
        <div class="mt-6">
          <button
            @click="startImport"
            :disabled="isImporting || previewData.length === 0"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isImporting" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing...
            </span>
            <span v-else>Import Questions</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Export Section -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
      <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">Export Questions</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Format
          </label>
          <select
            v-model="exportOptions.format"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="json">JSON</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Include Fields
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeFields"
                type="checkbox"
                value="tags"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Tags</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeFields"
                type="checkbox"
                value="explanation"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Explanation</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeFields"
                type="checkbox"
                value="options"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Answer Options</span>
            </label>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="exportQuestions"
          :disabled="isExporting"
          class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isExporting" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </span>
          <span v-else>Export All Questions</span>
        </button>
      </div>
    </div>

    <!-- Progress Modal -->
    <div
      v-if="showProgressModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Import Progress
        </h3>
        
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Processed: {{ importProgress.processed }}</span>
              <span>{{ importProgress.total }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(importProgress.processed / importProgress.total) * 100}%` }"
              ></div>
            </div>
          </div>
          
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p>Success: {{ importProgress.success }}</p>
            <p>Errors: {{ importProgress.errors }}</p>
            <p>Skipped: {{ importProgress.skipped }}</p>
          </div>
          
          <div v-if="importProgress.processed === importProgress.total" class="pt-4">
            <button
              @click="closeProgressModal"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import pocketbaseService from '../../../services/pocketbase'

const emit = defineEmits(['import-complete', 'export-complete'])

// State
const fileInput = ref(null)
const selectedFile = ref(null)
const previewData = ref([])
const isImporting = ref(false)
const isExporting = ref(false)
const showProgressModal = ref(false)

// Import options
const importOptions = reactive({
  duplicateHandling: 'skip',
  defaultCategory: '',
  defaultLevel: '',
  defaultPoints: 1
})

// Export options
const exportOptions = reactive({
  format: 'csv',
  includeFields: ['tags', 'explanation', 'options']
})

// Import progress
const importProgress = reactive({
  processed: 0,
  total: 0,
  success: 0,
  errors: 0,
  skipped: 0
})

// Methods
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  selectedFile.value = file
  await parseFile(file)
}

const removeFile = () => {
  selectedFile.value = null
  previewData.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const parseFile = async (file) => {
  try {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      await parseCSV(file)
    } else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      await parseExcel(file)
    } else {
      alert('Unsupported file type. Please use CSV, XLSX, or XLS files.')
      removeFile()
    }
  } catch (error) {
    console.error('Error parsing file:', error)
    alert('Error parsing file. Please check the file format.')
    removeFile()
  }
}

const parseCSV = async (file) => {
  const text = await file.text()
  const lines = text.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  const data = []
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row = {}
      headers.forEach((header, index) => {
        row[header.toLowerCase()] = values[index] || ''
      })
      data.push(validateRow(row))
    }
  }
  
  previewData.value = data
}

const parseExcel = async (file) => {
  // For now, we'll show a placeholder. In production, use a library like SheetJS
  alert('Excel parsing will be implemented with SheetJS library')
  removeFile()
}

const validateRow = (row) => {
  const validated = { ...row }
  
  // Set defaults if not provided
  if (!validated.category && importOptions.defaultCategory) {
    validated.category = importOptions.defaultCategory
  }
  if (!validated.level && importOptions.defaultLevel) {
    validated.level = importOptions.defaultLevel
  }
  if (!validated.points && importOptions.defaultPoints) {
    validated.points = parseInt(importOptions.defaultPoints)
  }
  
  // Validate required fields
  if (!validated.question) {
    validated.status = 'Error: Missing question text'
  } else if (!validated.type) {
    validated.status = 'Error: Missing question type'
  } else if (!validated.category) {
    validated.status = 'Error: Missing category'
  } else if (!validated.level) {
    validated.status = 'Error: Missing level'
  } else if (!validated.points) {
    validated.status = 'Error: Missing points'
  } else {
    validated.status = 'Ready to import'
  }
  
  return validated
}

const startImport = async () => {
  if (previewData.value.length === 0) return
  
  isImporting.value = true
  showProgressModal.value = true
  
  importProgress.total = previewData.value.length
  importProgress.processed = 0
  importProgress.success = 0
  importProgress.errors = 0
  importProgress.skipped = 0
  
  try {
    for (const item of previewData.value) {
      if (item.status === 'Ready to import') {
        try {
          await importQuestion(item)
          importProgress.success++
        } catch (error) {
          console.error('Error importing question:', error)
          importProgress.errors++
        }
      } else {
        importProgress.skipped++
      }
      
      importProgress.processed++
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    emit('import-complete', {
      total: importProgress.total,
      success: importProgress.success,
      errors: importProgress.errors,
      skipped: importProgress.skipped
    })
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    isImporting.value = false
  }
}

const importQuestion = async (item) => {
  const questionData = {
    question: item.question,
    type: item.type,
    category: item.category,
    level: item.level,
    points: parseInt(item.points),
    tags: item.tags ? item.tags.split(';').map(t => t.trim()) : [],
    explanation: item.explanation || '',
    options: item.options ? item.options.split(';').map(o => o.trim()) : []
  }
  
  // Handle duplicates
  if (importOptions.duplicateHandling === 'skip') {
    const existing = await pocketbaseService.pb.collection('questions').getFirstListItem(`question = "${item.question}"`)
    if (existing) {
      return // Skip duplicate
    }
  } else if (importOptions.duplicateHandling === 'update') {
    const existing = await pocketbaseService.pb.collection('questions').getFirstListItem(`question = "${item.question}"`)
    if (existing) {
      await pocketbaseService.pb.collection('questions').update(existing.id, questionData)
      return
    }
  }
  
  // Create new question
  await pocketbaseService.pb.collection('questions').create(questionData)
}

const exportQuestions = async () => {
  isExporting.value = true
  
  try {
    const records = await pocketbaseService.pb.collection('questions').getList(1, 1000, {
      sort: '-created'
    })
    
    const questions = records.items.map(q => {
      const exportItem = {
        question: q.question,
        type: q.type,
        category: q.category,
        level: q.level,
        points: q.points
      }
      
      if (exportOptions.includeFields.includes('tags') && q.tags) {
        exportItem.tags = q.tags.join('; ')
      }
      if (exportOptions.includeFields.includes('explanation') && q.explanation) {
        exportItem.explanation = q.explanation
      }
      if (exportOptions.includeFields.includes('options') && q.options) {
        exportItem.options = q.options.join('; ')
      }
      
      return exportItem
    })
    
    if (exportOptions.format === 'csv') {
      downloadCSV(questions, 'questions_export.csv')
    } else if (exportOptions.format === 'json') {
      downloadJSON(questions, 'questions_export.json')
    } else {
      alert('Excel export will be implemented with SheetJS library')
    }
    
    emit('export-complete', { count: questions.length, format: exportOptions.format })
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  } finally {
    isExporting.value = false
  }
}

const downloadCSV = (data, filename) => {
  const headers = Object.keys(data[0])
  const csvContent = [headers, ...data.map(row => headers.map(header => `"${row[header] || ''}"`))]
    .map(row => row.join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const downloadJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const closeProgressModal = () => {
  showProgressModal.value = false
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusClass = (status) => {
  if (status.includes('Error')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  } else if (status === 'Ready to import') {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  } else {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }
}
</script>
