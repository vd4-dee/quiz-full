<template>
  <div class="live-statistics">
    <!-- Header -->
    <div class="header">
      <h1 class="text-3xl font-bold text-gray-800">📊 Live Statistics Dashboard</h1>
      <div class="status-indicator">
        <span class="status-dot" :class="{ active: isConnected }"></span>
        <span class="status-text">{{ isConnected ? 'Live' : 'Disconnected' }}</span>
      </div>
    </div>

    <!-- Current Activity Panel -->
    <div class="activity-panel">
      <h2 class="text-xl font-semibold mb-4">🎯 Current Activity</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ liveStats.activeUsers }}</div>
          <div class="stat-label">Active Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-value">{{ liveStats.activeQuizzes }}</div>
          <div class="stat-label">Active Quizzes</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ liveStats.submissionsLastHour }}</div>
          <div class="stat-label">Submissions (1h)</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">{{ liveStats.avgScore24h }}%</div>
          <div class="stat-label">Avg Score (24h)</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-value">{{ liveStats.systemPerformance }}ms</div>
          <div class="stat-label">Response Time</div>
        </div>
      </div>
    </div>

    <!-- Live Performance Charts -->
    <div class="charts-section">
      <h2 class="text-xl font-semibold mb-4">📈 Live Performance Charts</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Minute-by-Minute Activity -->
        <div class="chart-container">
          <h3 class="text-lg font-medium mb-3">Minute-by-Minute Activity</h3>
          <div class="chart-placeholder">
            <div class="chart-data">
              <div v-for="(data, index) in liveStats.minutelyActivity.slice(-10)" :key="index" class="data-point">
                <span class="time">{{ formatTime(data.timestamp) }}</span>
                <span class="users">{{ data.activeUsers }} users</span>
                <span class="submissions">{{ data.submissionsCompleted }} submissions</span>
                <span class="score">{{ data.averageScore }}% avg</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hourly Statistics -->
        <div class="chart-container">
          <h3 class="text-lg font-medium mb-3">Hourly Statistics</h3>
          <div class="chart-placeholder">
            <div class="chart-data">
              <div v-for="(data, index) in liveStats.hourlyStats.slice(-6)" :key="index" class="data-point">
                <span class="time">{{ formatHour(data.hour) }}</span>
                <span class="total">{{ data.totalSubmissions }} total</span>
                <span class="score">{{ data.averageScore }}% avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Performance Hotspots -->
    <div class="hotspots-section">
      <h2 class="text-xl font-semibold mb-4">🔥 Question Performance Hotspots</h2>
      <div class="hotspots-grid">
        <div v-for="hotspot in liveStats.questionHotspots" :key="hotspot.questionId" class="hotspot-card">
          <div class="hotspot-header">
            <span class="question-id">{{ hotspot.questionId }}</span>
            <span class="success-rate" :class="getSuccessRateClass(hotspot.currentSuccessRate)">
              {{ hotspot.currentSuccessRate }}%
            </span>
          </div>
          <div class="question-text">{{ hotspot.questionText }}</div>
          <div class="hotspot-stats">
            <span class="attempts">{{ hotspot.recentAttempts }} attempts</span>
            <span class="time">{{ hotspot.avgTimeSpent }}s avg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts Panel -->
    <div class="alerts-section">
      <h2 class="text-xl font-semibold mb-4">🚨 Performance Alerts</h2>
      <div class="alerts-grid">
        <!-- Low Performance Questions -->
        <div class="alert-category">
          <h3 class="text-lg font-medium mb-3 text-red-600">Low Performance Questions</h3>
          <div class="alert-list">
            <div v-for="alert in performanceAlerts.lowPerformanceQuestions" :key="alert.questionId" class="alert-item">
              <div class="alert-header">
                <span class="question-id">{{ alert.questionId }}</span>
                <span class="success-rate">{{ alert.successRate }}%</span>
              </div>
              <div class="alert-details">
                <span class="category">{{ alert.category }}</span>
                <span class="recommendation">{{ alert.recommendation }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Unusual Activity -->
        <div class="alert-category">
          <h3 class="text-lg font-medium mb-3 text-orange-600">Unusual Activity</h3>
          <div class="alert-list">
            <div v-for="alert in performanceAlerts.unusualActivity" :key="alert.userId" class="alert-item">
              <div class="alert-header">
                <span class="user-id">{{ alert.userId }}</span>
                <span class="risk-score">{{ alert.riskScore }}/10</span>
              </div>
              <div class="alert-details">
                <span class="type">{{ alert.type }}</span>
                <span class="details">{{ alert.details }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Performance -->
        <div class="alert-category">
          <h3 class="text-lg font-medium mb-3 text-blue-600">System Performance</h3>
          <div class="alert-list">
            <div v-for="alert in performanceAlerts.systemPerformance" :key="alert.metric" class="alert-item">
              <div class="alert-header">
                <span class="metric">{{ alert.metric }}</span>
                <span class="value">{{ alert.currentValue }}/{{ alert.threshold }}</span>
              </div>
              <div class="alert-details">
                <span class="type">{{ alert.type }}</span>
                <span class="impact">{{ alert.impact }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Predictive Insights -->
    <div class="insights-section">
      <h2 class="text-xl font-semibold mb-4">🔮 Predictive Insights</h2>
      <div class="insights-grid">
        <div class="insight-card">
          <h3 class="text-lg font-medium mb-3">User Performance Trends</h3>
          <div class="insight-content">
            <div v-for="insight in predictiveInsights.userPerformanceTrend" :key="insight.userId" class="insight-item">
              <div class="insight-header">
                <span class="user-id">{{ insight.userId }}</span>
                <span class="confidence">{{ (insight.confidence * 100).toFixed(0) }}% confidence</span>
              </div>
              <div class="insight-details">
                <span class="prediction">Next score: {{ insight.predictedNextScore }}</span>
                <span class="difficulty">Recommended: {{ insight.recommendedDifficulty }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="insight-card">
          <h3 class="text-lg font-medium mb-3">Question Quality Prediction</h3>
          <div class="insight-content">
            <div v-for="insight in predictiveInsights.questionQuality" :key="insight.questionId" class="insight-item">
              <div class="insight-header">
                <span class="question-id">{{ insight.questionId }}</span>
                <span class="quality-score">{{ insight.qualityScore }}/10</span>
              </div>
              <div class="insight-details">
                <span class="prediction">Success rate: {{ insight.predictedSuccessRate }}%</span>
                <span class="recommendation" :class="{ 'replace': insight.replacementRecommended }">
                  {{ insight.replacementRecommended ? 'Replace' : 'Keep' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Controls -->
    <div class="export-section">
      <h2 class="text-xl font-semibold mb-4">📤 Export & Reports</h2>
      <div class="export-controls">
        <button @click="exportToCSV" class="export-btn">
          📊 Export to CSV
        </button>
        <button @click="exportToExcel" class="export-btn">
          📈 Export to Excel
        </button>
        <button @click="generatePDFReport" class="export-btn">
          📄 Generate PDF Report
        </button>
        <button @click="scheduleReport" class="export-btn">
          ⏰ Schedule Report
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'LiveStatistics',
  setup() {
    const isConnected = ref(false)
    const updateInterval = ref(null)
    
    // Live statistics data
    const liveStats = ref({
      activeUsers: 0,
      activeQuizzes: 0,
      submissionsLastHour: 0,
      avgScore24h: 0,
      systemPerformance: 0,
      minutelyActivity: [],
      hourlyStats: [],
      questionHotspots: []
    })

    // Performance alerts
    const performanceAlerts = ref({
      lowPerformanceQuestions: [],
      unusualActivity: [],
      systemPerformance: []
    })

    // Predictive insights
    const predictiveInsights = ref({
      userPerformanceTrend: [],
      questionQuality: [],
      expectedLoad: []
    })

    // Initialize real-time updates
    const startRealTimeUpdates = () => {
      updateInterval.value = setInterval(async () => {
        await fetchLatestStats()
        checkForAlerts()
        updatePerformanceMetrics()
      }, 30000) // Update every 30 seconds
    }

    // Fetch latest statistics
    const fetchLatestStats = async () => {
      try {
        // This would typically fetch from API
        // For now, generate mock data
        liveStats.value = {
          activeUsers: Math.floor(Math.random() * 50) + 10,
          activeQuizzes: Math.floor(Math.random() * 20) + 5,
          submissionsLastHour: Math.floor(Math.random() * 100) + 20,
          avgScore24h: Math.floor(Math.random() * 30) + 70,
          systemPerformance: Math.floor(Math.random() * 100) + 50,
          minutelyActivity: generateMinutelyActivity(),
          hourlyStats: generateHourlyStats(),
          questionHotspots: generateQuestionHotspots()
        }
        
        isConnected.value = true
      } catch (error) {
        console.error('Error fetching latest stats:', error)
        isConnected.value = false
      }
    }

    // Generate mock minutely activity data
    const generateMinutelyActivity = () => {
      const data = []
      const now = new Date()
      
      for (let i = 9; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000)
        data.push({
          timestamp: time.toISOString(),
          activeUsers: Math.floor(Math.random() * 20) + 5,
          submissionsCompleted: Math.floor(Math.random() * 10) + 1,
          averageScore: Math.floor(Math.random() * 30) + 70
        })
      }
      
      return data
    }

    // Generate mock hourly stats
    const generateHourlyStats = () => {
      const data = []
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000)
        data.push({
          hour: time.toISOString(),
          totalSubmissions: Math.floor(Math.random() * 100) + 20,
          averageScore: Math.floor(Math.random() * 30) + 70,
          categoryBreakdown: {
            Excel: { submissions: Math.floor(Math.random() * 30) + 10, avgScore: Math.floor(Math.random() * 30) + 70 },
            Python: { submissions: Math.floor(Math.random() * 40) + 15, avgScore: Math.floor(Math.random() * 30) + 65 },
            Pandas: { submissions: Math.floor(Math.random() * 30) + 10, avgScore: Math.floor(Math.random() * 30) + 60 }
          }
        })
      }
      
      return data
    }

    // Generate mock question hotspots
    const generateQuestionHotspots = () => {
      return [
        {
          questionId: 'q123',
          questionText: 'Which Excel function is used to find the maximum value in a range?',
          currentSuccessRate: 45.2,
          recentAttempts: 28,
          avgTimeSpent: 125
        },
        {
          questionId: 'q456',
          questionText: 'What is the correct syntax for a Python list comprehension?',
          currentSuccessRate: 78.9,
          recentAttempts: 35,
          avgTimeSpent: 89
        },
        {
          questionId: 'q789',
          questionText: 'How do you merge two DataFrames in Pandas?',
          currentSuccessRate: 32.1,
          recentAttempts: 22,
          avgTimeSpent: 156
        }
      ]
    }

    // Check for performance alerts
    const checkForAlerts = () => {
      performanceAlerts.value = {
        lowPerformanceQuestions: [
          {
            questionId: 'q789',
            successRate: 23.5,
            category: 'Python',
            recommendation: 'Review question clarity or difficulty'
          }
        ],
        unusualActivity: [
          {
            type: 'SUSPICIOUS_BEHAVIOR',
            userId: 'u789',
            details: 'Completed quiz in 2 minutes (expected 15 minutes)',
            riskScore: 8.5,
            requiresReview: true
          }
        ],
        systemPerformance: [
          {
            type: 'HIGH_LOAD',
            metric: 'Concurrent Users',
            currentValue: 47,
            threshold: 45,
            impact: 'Response time may increase'
          }
        ]
      }
    }

    // Update performance metrics
    const updatePerformanceMetrics = () => {
      predictiveInsights.value = {
        userPerformanceTrend: [
          {
            userId: 'u123',
            predictedNextScore: 82.3,
            confidence: 0.87,
            recommendedDifficulty: 'Normal'
          }
        ],
        questionQuality: [
          {
            questionId: 'q789',
            predictedSuccessRate: 68.2,
            qualityScore: 7.8,
            replacementRecommended: false
          }
        ],
        expectedLoad: [
          {
            timeSlot: '15:00-16:00',
            expectedUsers: 23,
            recommendedCapacity: 'Normal'
          }
        ]
      }
    }

    // Export functions
    const exportToCSV = () => {
      console.log('Exporting to CSV...')
      // Implementation would go here
    }

    const exportToExcel = () => {
      console.log('Exporting to Excel...')
      // Implementation would go here
    }

    const generatePDFReport = () => {
      console.log('Generating PDF report...')
      // Implementation would go here
    }

    const scheduleReport = () => {
      console.log('Scheduling report...')
      // Implementation would go here
    }

    // Utility functions
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const formatHour = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        hour12: false 
      })
    }

    const getSuccessRateClass = (rate) => {
      if (rate < 30) return 'text-red-600'
      if (rate < 60) return 'text-orange-600'
      if (rate < 80) return 'text-yellow-600'
      return 'text-green-600'
    }

    // Lifecycle hooks
    onMounted(() => {
      fetchLatestStats()
      startRealTimeUpdates()
    })

    onUnmounted(() => {
      if (updateInterval.value) {
        clearInterval(updateInterval.value)
      }
    })

    return {
      isConnected,
      liveStats,
      performanceAlerts,
      predictiveInsights,
      exportToCSV,
      exportToExcel,
      generatePDFReport,
      scheduleReport,
      formatTime,
      formatHour,
      getSuccessRateClass
    }
  }
}
</script>

<style scoped>
.live-statistics {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ef4444;
  transition: background-color 0.3s ease;
}

.status-dot.active {
  background-color: #10b981;
}

.status-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.activity-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.charts-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.chart-container {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.chart-placeholder {
  min-height: 200px;
  background: white;
  border-radius: 0.375rem;
  padding: 1rem;
}

.chart-data {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-point {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem;
  background: #f1f5f9;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.hotspots-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.hotspots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.hotspot-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.hotspot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.question-id {
  font-weight: 600;
  color: #374151;
}

.success-rate {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #fef3c7;
  color: #92400e;
}

.question-text {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.hotspot-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.alerts-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.alert-category h3 {
  margin-bottom: 1rem;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.alert-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.insights-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.insight-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.insight-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-item {
  background: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.insight-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.export-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.export-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.export-btn:hover {
  background: #2563eb;
}

.replace {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 768px) {
  .live-statistics {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .export-controls {
    flex-direction: column;
  }
}
</style>
