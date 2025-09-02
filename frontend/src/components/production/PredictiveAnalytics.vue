<template>
  <div class="predictive-analytics">
    <!-- Analytics Dashboard -->
    <div v-if="showDashboard" class="analytics-dashboard">
      <div class="dashboard-header">
        <h3 class="dashboard-title">Predictive Analytics</h3>
        <button @click="toggleDashboard" class="close-btn">×</button>
      </div>
      
      <!-- Analysis Status -->
      <div class="analysis-status">
        <div class="status-item">
          <span class="status-label">Status:</span>
          <span class="status-value" :class="analysisStatusClass">{{ analysisStatusText }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Accuracy:</span>
          <span class="status-value">{{ accuracy }}%</span>
        </div>
      </div>
      
      <!-- ML Models -->
      <div class="ml-models">
        <h4 class="models-title">ML Models</h4>
        <div class="model-grid">
          <div v-for="model in mlModels" :key="model.id" class="model-card">
            <div class="model-header">
              <span class="model-name">{{ model.name }}</span>
              <span class="model-accuracy">{{ model.accuracy }}%</span>
            </div>
            <div class="model-actions">
              <button @click="trainModel(model.id)" class="model-btn" :disabled="model.status === 'training'">
                {{ model.status === 'training' ? 'Training...' : 'Train' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Predictions -->
      <div class="predictions">
        <h4 class="predictions-title">Predictions</h4>
        <div class="prediction-list">
          <div v-for="prediction in currentPredictions" :key="prediction.id" class="prediction-item">
            <div class="prediction-content">{{ prediction.description }}</div>
            <div class="prediction-confidence">{{ prediction.confidence }}%</div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="analytics-actions">
        <button @click="runAnalysis" class="action-btn run" :disabled="isAnalyzing">
          {{ isAnalyzing ? 'Analyzing...' : 'Run Analysis' }}
        </button>
        <button @click="exportInsights" class="action-btn export">Export</button>
      </div>
    </div>
    
    <!-- Toggle Button -->
    <button v-if="!showDashboard" @click="toggleDashboard" class="analytics-toggle-btn">
      🧠
    </button>
    
    <!-- Main Content -->
    <div class="analytics-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  showDashboard: { type: Boolean, default: false }
})

// Emits
const emit = defineEmits(['analysis-started', 'analysis-completed'])

// Reactive state
const showDashboard = ref(props.showDashboard)
const isAnalyzing = ref(false)
const analysisStatus = ref('idle')
const accuracy = ref(0)

// ML Models
const mlModels = ref([
  { id: 'perf', name: 'Performance Predictor', accuracy: 85, status: 'ready' },
  { id: 'diff', name: 'Difficulty Adjuster', accuracy: 78, status: 'ready' },
  { id: 'eng', name: 'Engagement Forecaster', accuracy: 72, status: 'ready' }
])

// Predictions
const currentPredictions = ref([
  { id: '1', description: 'User likely to improve by 15%', confidence: 87 },
  { id: '2', description: 'High risk of performance decline', confidence: 73 }
])

// Computed
const analysisStatusClass = computed(() => `status-${analysisStatus.value}`)
const analysisStatusText = computed(() => {
  const statusMap = { idle: 'Ready', analyzing: 'Analyzing...', completed: 'Completed' }
  return statusMap[analysisStatus.value] || analysisStatus.value
})

// Methods
const runAnalysis = async () => {
  if (isAnalyzing.value) return
  
  isAnalyzing.value = true
  analysisStatus.value = 'analyzing'
  emit('analysis-started')
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    analysisStatus.value = 'completed'
    accuracy.value = Math.floor(Math.random() * 20) + 75
    emit('analysis-completed')
  } finally {
    isAnalyzing.value = false
  }
}

const trainModel = async (modelId) => {
  const model = mlModels.value.find(m => m.id === modelId)
  if (!model) return
  
  model.status = 'training'
  await new Promise(resolve => setTimeout(resolve, 3000))
  model.status = 'ready'
  model.accuracy = Math.floor(Math.random() * 20) + 70
}

const toggleDashboard = () => {
  showDashboard.value = !showDashboard.value
}

const exportInsights = () => {
  const insights = { models: mlModels.value, predictions: currentPredictions.value }
  const dataStr = JSON.stringify(insights, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `analytics-${Date.now()}.json`
  link.click()
}

// Expose methods
defineExpose({
  runAnalysis,
  trainModel,
  exportInsights
})
</script>

<style scoped>
.predictive-analytics {
  position: relative;
}

.analytics-dashboard {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 400px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  font-size: 0.875rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.analysis-status {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.status-label {
  color: #6b7280;
  font-weight: 500;
}

.status-value {
  color: #111827;
  font-weight: 600;
}

.status-value.status-completed {
  color: #059669;
}

.status-value.status-analyzing {
  color: #2563eb;
}

.ml-models {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.models-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.model-grid {
  display: grid;
  gap: 0.5rem;
}

.model-card {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.model-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.75rem;
}

.model-accuracy {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 0.25rem;
  font-weight: 600;
}

.model-actions {
  display: flex;
  gap: 0.25rem;
}

.model-btn {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: #10b981;
  color: white;
  cursor: pointer;
  font-size: 0.625rem;
}

.model-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.predictions {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.predictions-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.prediction-list {
  space-y: 0.5rem;
}

.prediction-item {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prediction-content {
  font-size: 0.75rem;
  color: #6b7280;
  flex: 1;
  margin-right: 0.5rem;
}

.prediction-confidence {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 0.25rem;
  font-weight: 600;
}

.analytics-actions {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.action-btn.run {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.action-btn.run:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.export:hover {
  background: #f9fafb;
}

.analytics-toggle-btn {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 50%;
  background: #8b5cf6;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.analytics-content {
  width: 100%;
}

@media (max-width: 640px) {
  .analytics-dashboard {
    width: calc(100vw - 2rem);
    right: 1rem;
    left: 1rem;
  }
}
</style>
