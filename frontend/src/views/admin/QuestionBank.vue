<template>
  <AdminLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Question Bank</h1>
      <p class="text-gray-500 dark:text-gray-400">Create, organize, and manage quiz questions.</p>
    </div>

    <!-- Import/Export Section -->
    <div class="mb-6">
      <QuestionImport
        @import-complete="handleImportComplete"
        @export-complete="handleExportComplete"
      />
    </div>

    <!-- Question Table -->
    <QuestionTable
      :questions="questions"
      @create="showCreateModal = true"
      @edit="editQuestion"
      @preview="previewQuestion"
      @delete="deleteQuestion"
      @bulk-delete="bulkDeleteQuestions"
      @bulk-export="bulkExportQuestions"
      @bulk-category-change="bulkChangeCategory"
    />

    <!-- Create/Edit Question Modal -->
    <QuestionFormModal
      v-if="showCreateModal || showEditModal"
      :question="editingQuestion"
      :is-editing="showEditModal"
      @close="closeModal"
      @save="saveQuestion"
    />

    <!-- Question Preview Modal -->
    <div
      v-if="showPreviewModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Question Preview</h2>
          <button
            @click="showPreviewModal = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="prose dark:prose-invert max-w-none">
            <h3 class="text-lg font-medium mb-4">{{ previewingQuestion?.question }}</h3>
            
            <div v-if="previewingQuestion?.type === 'multiple_choice'" class="space-y-3">
              <div
                v-for="(option, index) in previewingQuestion?.options"
                :key="index"
                class="flex items-center space-x-3"
              >
                <input type="radio" :name="'preview_answer'" :value="index" disabled />
                <span>{{ option }}</span>
                <span
                  v-if="index === previewingQuestion?.correctAnswer"
                  class="text-green-600 text-sm font-medium"
                >
                  ✓ Correct Answer
                </span>
              </div>
            </div>

            <div v-if="previewingQuestion?.type === 'true_false'" class="space-y-3">
              <div class="flex items-center space-x-3">
                <input type="radio" name="preview_answer" value="true" disabled />
                <span>True</span>
                <span
                  v-if="previewingQuestion?.correctAnswer === true"
                  class="text-green-600 text-sm font-medium"
                >
                  ✓ Correct Answer
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <input type="radio" name="preview_answer" value="false" disabled />
                <span>False</span>
                <span
                  v-if="previewingQuestion?.correctAnswer === false"
                  class="text-green-600 text-sm font-medium"
                >
                  ✓ Correct Answer
                </span>
              </div>
            </div>

            <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">
                    {{ formatQuestionType(previewingQuestion?.type) }}
                  </span>
                </div>
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">
                    {{ formatCategory(previewingQuestion?.category) }}
                  </span>
                </div>
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Level:</span>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">
                    {{ formatLevel(previewingQuestion?.level) }}
                  </span>
                </div>
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Points:</span>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">
                    {{ previewingQuestion?.points }}
                  </span>
                </div>
              </div>
              
              <div v-if="previewingQuestion?.tags && previewingQuestion.tags.length > 0" class="mt-4">
                <span class="font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="tag in previewingQuestion.tags"
                    :key="tag"
                    class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              
              <div v-if="previewingQuestion?.explanation" class="mt-4">
                <span class="font-medium text-gray-700 dark:text-gray-300">Explanation:</span>
                <p class="mt-2 text-gray-600 dark:text-gray-400">{{ previewingQuestion.explanation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import QuestionTable from '../../components/admin/QuestionBank/QuestionTable.vue'
import QuestionFormModal from '../../components/admin/QuestionBank/QuestionFormModal.vue'
import QuestionImport from '../../components/admin/QuestionBank/QuestionImport.vue'
import pocketbaseService from '../../services/pocketbase'

// State
const questions = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showPreviewModal = ref(false)
const editingQuestion = ref(null)
const previewingQuestion = ref(null)

// Load questions on mount
onMounted(async () => {
  await loadQuestions()
})

// Methods
const loadQuestions = async () => {
  try {
    const records = await pocketbaseService.pb.collection('questions').getList(1, 1000, {
      sort: '-created'
    })
    questions.value = records.items
  } catch (error) {
    console.error('Error loading questions:', error)
  }
}

const editQuestion = (question) => {
  editingQuestion.value = question
  showEditModal.value = true
}

const previewQuestion = (question) => {
  previewingQuestion.value = question
  showPreviewModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingQuestion.value = null
}

const saveQuestion = async (questionData) => {
  try {
    if (editingQuestion.value) {
      // Update existing question
      await pocketbaseService.pb.collection('questions').update(editingQuestion.value.id, questionData)
    } else {
      // Create new question
      await pocketbaseService.pb.collection('questions').create(questionData)
    }
    
    await loadQuestions()
    closeModal()
  } catch (error) {
    console.error('Error saving question:', error)
    throw error
  }
}

const deleteQuestion = async (id) => {
  try {
    await pocketbaseService.pb.collection('questions').delete(id)
    await loadQuestions()
  } catch (error) {
    console.error('Error deleting question:', error)
  }
}

const bulkDeleteQuestions = async (questionIds) => {
  try {
    for (const id of questionIds) {
      await pocketbaseService.pb.collection('questions').delete(id)
    }
    await loadQuestions()
  } catch (error) {
    console.error('Error bulk deleting questions:', error)
  }
}

const bulkExportQuestions = async (questionIds) => {
  try {
    const selectedQuestions = questions.value.filter(q => questionIds.includes(q.id))
    const csvContent = convertToCSV(selectedQuestions)
    downloadCSV(csvContent, 'questions_export.csv')
  } catch (error) {
    console.error('Error exporting questions:', error)
  }
}

const bulkChangeCategory = async ({ questionIds, category }) => {
  try {
    for (const id of questionIds) {
      await pocketbaseService.pb.collection('questions').update(id, { category })
    }
    await loadQuestions()
  } catch (error) {
    console.error('Error changing category:', error)
  }
}

const handleImportComplete = async (result) => {
  console.log('Import completed:', result)
  await loadQuestions()
  // You can add a toast notification here
}

const handleExportComplete = (result) => {
  console.log('Export completed:', result)
  // You can add a toast notification here
}

const convertToCSV = (questions) => {
  const headers = ['Question', 'Type', 'Category', 'Level', 'Points', 'Tags', 'Explanation']
  const rows = questions.map(q => [
    q.question,
    q.type,
    q.category,
    q.level,
    q.points,
    q.tags?.join('; ') || '',
    q.explanation || ''
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const formatQuestionType = (type) => {
  const types = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True/False',
    short_answer: 'Short Answer',
    essay: 'Essay'
  }
  return types[type] || type
}

const formatCategory = (category) => {
  const categories = {
    mathematics: 'Mathematics',
    science: 'Science',
    history: 'History',
    literature: 'Literature',
    geography: 'Geography',
    computer_science: 'Computer Science'
  }
  return categories[category] || category
}

const formatLevel = (level) => {
  const levels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  }
  return levels[level] || level
}
</script>
