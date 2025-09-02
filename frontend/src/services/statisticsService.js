// services/statisticsService.js
import pocketbaseService from './pocketbase'

class StatisticsService {
  /**
   * Get all submissions for a user with quiz details
   */
  async getUserSubmissions(userId) {
    try {
      const submissions = await pocketbaseService.pb.collection('submissions').getFullList({
        filter: `user = "${userId}"`,
        expand: 'quiz',
        sort: '-created'
      })
      return { success: true, data: submissions }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Calculate performance metrics from user submissions
   */
  calculateUserStatistics(submissions) {
    if (!submissions || submissions.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalTime: 0,
        currentRank: 'N/A',
        categoryScores: { excel: 0, python: 0, pandas: 0 },
        improvementTrend: 0,
        studyStreak: 0,
        // New metrics
        totalPoints: 0,
        uniqueQuestionsAnswered: 0,
        accuracyRate: 0,
        totalQuestionsAttempted: 0,
        correctAnswers: 0
      }
    }

    // Basic metrics
    const totalQuizzes = submissions.length
    const scores = submissions.map(s => s.score || 0)
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalQuizzes)
    const bestScore = Math.max(...scores)
    
    // Time calculations
    const totalTime = submissions.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600 // Convert to hours
    
    // New metrics calculation
    const totalPoints = submissions.reduce((sum, s) => sum + (s.score || 0), 0)
    const { uniqueQuestionsAnswered, totalQuestionsAttempted, correctAnswers } = this.calculateQuestionMetrics(submissions)
    const accuracyRate = totalQuestionsAttempted > 0 ? Math.round((correctAnswers / totalQuestionsAttempted) * 100) : 0
    
    // Category performance
    const categoryScores = this.calculateCategoryPerformance(submissions)
    
    // Improvement trend (first 5 vs last 5)
    const improvementTrend = this.calculateImprovementTrend(submissions)
    
    // Study streak
    const studyStreak = this.calculateStudyStreak(submissions)

    return {
      totalQuizzes,
      averageScore,
      bestScore,
      totalTime: Math.round(totalTime * 10) / 10,
      currentRank: 'N/A', // Will be calculated separately
      categoryScores,
      improvementTrend,
      studyStreak,
      // New metrics
      totalPoints,
      uniqueQuestionsAnswered,
      accuracyRate,
      totalQuestionsAttempted,
      correctAnswers
    }
  }

  /**
   * Calculate question-based metrics
   */
  calculateQuestionMetrics(submissions) {
    const uniqueQuestions = new Set()
    let totalQuestionsAttempted = 0
    let correctAnswers = 0

    submissions.forEach(submission => {
      if (submission.answers && Array.isArray(submission.answers)) {
        submission.answers.forEach(answer => {
          if (answer.questionId) {
            uniqueQuestions.add(answer.questionId)
            totalQuestionsAttempted++
            if (answer.isCorrect) {
              correctAnswers++
            }
          }
        })
      }
    })

    return {
      uniqueQuestionsAnswered: uniqueQuestions.size,
      totalQuestionsAttempted,
      correctAnswers
    }
  }

  /**
   * Calculate performance by category
   */
  calculateCategoryPerformance(submissions) {
    const categories = { excel: [], python: [], pandas: [] }
    
    submissions.forEach(submission => {
      if (submission.expand?.quiz?.category) {
        const category = submission.expand.quiz.category.toLowerCase()
        if (categories[category]) {
          categories[category].push(submission.score || 0)
        }
      }
    })

    return {
      excel: this.calculateAverage(categories.excel),
      python: this.calculateAverage(categories.python),
      pandas: this.calculateAverage(categories.pandas)
    }
  }

  /**
   * Calculate improvement trend
   */
  calculateImprovementTrend(submissions) {
    if (submissions.length < 10) return 0
    
    const first5 = submissions.slice(-5).map(s => s.score || 0)
    const last5 = submissions.slice(0, 5).map(s => s.score || 0)
    
    const first5Avg = this.calculateAverage(first5)
    const last5Avg = this.calculateAverage(last5)
    
    return Math.round(last5Avg - first5Avg)
  }

  /**
   * Calculate study streak (consecutive days)
   */
  calculateStudyStreak(submissions) {
    if (submissions.length === 0) return 0
    
    const dates = submissions.map(s => new Date(s.created).toDateString())
    const uniqueDates = [...new Set(dates)].sort()
    
    let streak = 1
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const current = new Date(uniqueDates[i])
      const previous = new Date(uniqueDates[i - 1])
      const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  /**
   * Calculate average from array of numbers
   */
  calculateAverage(numbers) {
    if (!numbers || numbers.length === 0) return 0
    return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length)
  }

  /**
   * Get recent quiz results for display
   */
  getRecentResults(submissions, limit = 5) {
    return submissions.slice(0, limit).map(submission => ({
      id: submission.id,
      quizName: submission.expand?.quiz?.title || 'Unknown Quiz',
      category: submission.expand?.quiz?.category || 'Unknown',
      score: submission.score || 0,
      date: submission.created
    }))
  }

  /**
   * Get time-based analytics
   */
  getTimeAnalytics(submissions) {
    if (!submissions || submissions.length === 0) {
      return {
        totalStudyTime: 0,
        averageTimePerQuiz: 0,
        mostActiveHours: [],
        studyFrequency: { daily: 0, weekly: 0, monthly: 0 }
      }
    }

    const totalStudyTime = submissions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const averageTimePerQuiz = totalStudyTime / submissions.length

    // Study frequency analysis
    const now = new Date()
    const daily = submissions.filter(s => {
      const submissionDate = new Date(s.created)
      return (now - submissionDate) < 24 * 60 * 60 * 1000
    }).length

    const weekly = submissions.filter(s => {
      const submissionDate = new Date(s.created)
      return (now - submissionDate) < 7 * 24 * 60 * 60 * 1000
    }).length

    const monthly = submissions.filter(s => {
      const submissionDate = new Date(s.created)
      return (now - submissionDate) < 30 * 24 * 60 * 60 * 1000
    }).length

    return {
      totalStudyTime: Math.round(totalStudyTime / 3600 * 10) / 10, // hours
      averageTimePerQuiz: Math.round(averageTimePerQuiz / 60), // minutes
      studyFrequency: { daily, weekly, monthly }
    }
  }

  /**
   * Get user's current rank in overall leaderboard
   */
  async getUserRank(userId) {
    try {
      const allSubmissions = await pocketbaseService.pb.collection('submissions').getFullList({
        expand: 'user,quiz',
        sort: '-created'
      })

      // Group submissions by user
      const userMetrics = this.groupSubmissionsByUser(allSubmissions)
      
      // Calculate rankings
      const rankings = Object.values(userMetrics).map(userData => {
        const questionMetrics = this.calculateQuestionMetrics(userData.submissions)
        return {
          userId: userData.userId,
          username: userData.username,
          name: userData.name,
          totalQuizzes: userData.submissions.length,
          averageScore: this.calculateAverage(userData.submissions.map(s => s.score || 0)),
          totalPoints: userData.submissions.reduce((sum, s) => sum + (s.score || 0), 0),
          uniqueQuestionsAnswered: questionMetrics.uniqueQuestionsAnswered,
          accuracyRate: questionMetrics.accuracyRate,
          totalQuestionsAttempted: questionMetrics.totalQuestionsAttempted,
          correctAnswers: questionMetrics.correctAnswers
        }
      })

      // Sort by weighted overall score
      const sortedRankings = rankings
        .filter(user => user.totalQuizzes >= 1)
        .sort((a, b) => this.calculateWeightedScore(b) - this.calculateWeightedScore(a))

      // Find user's rank
      const userIndex = sortedRankings.findIndex(u => u.userId === userId)
      return userIndex !== -1 ? userIndex + 1 : 'N/A'
    } catch (error) {
      console.error('Error getting user rank:', error)
      return 'N/A'
    }
  }

  /**
   * Group submissions by user
   */
  groupSubmissionsByUser(submissions) {
    const userMetrics = {}
    
    submissions.forEach(submission => {
      const userId = submission.user
      const userData = submission.expand?.user
      
      if (!userMetrics[userId]) {
        userMetrics[userId] = {
          userId,
          username: userData?.username || 'Unknown',
          name: userData?.name || 'Unknown User',
          submissions: []
        }
      }
      
      userMetrics[userId].submissions.push(submission)
    })
    
    return userMetrics
  }

  /**
   * Calculate weighted overall score for ranking
   */
  calculateWeightedScore(userStats) {
    const { averageScore, totalQuizzes, uniqueQuestionsAnswered, accuracyRate } = userStats
    
    // Weight factors
    const scoreWeight = 0.4
    const activityWeight = 0.25
    const questionsWeight = 0.2
    const accuracyWeight = 0.15
    
    return (
      (averageScore * scoreWeight) +
      (Math.min(totalQuizzes / 20, 1) * 100 * activityWeight) +
      (Math.min(uniqueQuestionsAnswered / 100, 1) * 100 * questionsWeight) +
      (accuracyRate * accuracyWeight)
    )
  }
}

export const statisticsService = new StatisticsService()
