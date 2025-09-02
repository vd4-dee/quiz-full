// services/leaderboardService.js
import pocketbaseService from './pocketbase'

class LeaderboardService {
  /**
   * Calculate overall rankings for all users
   */
  async calculateOverallRankings() {
    try {
      // Get all users with submissions
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
          avatar: userData.avatar,
          totalQuizzes: userData.submissions.length,
          averageScore: this.calculateAverage(userData.submissions.map(s => s.score || 0)),
          totalPoints: userData.submissions.reduce((sum, s) => sum + (s.score || 0), 0),
          improvementRate: this.calculateImprovementRate(userData.submissions),
          consistencyScore: this.calculateConsistency(userData.submissions),
          recentActivity: this.getRecentActivityScore(userData.submissions),
          category: this.getPreferredCategory(userData.submissions),
          // New metrics
          uniqueQuestionsAnswered: questionMetrics.uniqueQuestionsAnswered,
          accuracyRate: questionMetrics.accuracyRate,
          totalQuestionsAttempted: questionMetrics.totalQuestionsAttempted,
          correctAnswers: questionMetrics.correctAnswers
        }
      })

      // Sort by weighted overall score
      return rankings
        .filter(user => user.totalQuizzes >= 1) // Only users with at least 1 quiz
        .sort((a, b) => this.calculateWeightedScore(b) - this.calculateWeightedScore(a))
    } catch (error) {
      console.error('Error calculating overall rankings:', error)
      return []
    }
  }

  /**
   * Calculate category-specific rankings
   */
  async calculateCategoryRankings(category) {
    try {
      const submissions = await pocketbaseService.pb.collection('submissions').getFullList({
        filter: `quiz.category = "${category}"`,
        expand: 'user,quiz',
        sort: '-created'
      })

      const userMetrics = this.groupSubmissionsByUser(submissions)
      
      return Object.values(userMetrics)
        .map(userData => ({
          userId: userData.userId,
          username: userData.userId,
          name: userData.name,
          score: this.calculateAverage(userData.submissions.map(s => s.score || 0)),
          quizzesCompleted: userData.submissions.length
        }))
        .filter(user => user.quizzesCompleted >= 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5) // Top 5 per category
    } catch (error) {
      console.error(`Error calculating ${category} rankings:`, error)
      return []
    }
  }

  /**
   * Calculate most active users
   */
  async calculateMostActiveRankings() {
    try {
      const allSubmissions = await pocketbaseService.pb.collection('submissions').getFullList({
        expand: 'user,quiz',
        sort: '-created'
      })

      const userMetrics = this.groupSubmissionsByUser(allSubmissions)
      
      return Object.values(userMetrics)
        .map(userData => ({
          userId: userData.userId,
          username: userData.username,
          name: userData.name,
          quizzesCompleted: userData.submissions.length,
          recentActivity: this.getRecentActivityScore(userData.submissions),
          studyStreak: this.calculateStudyStreak(userData.submissions)
        }))
        .filter(user => user.quizzesCompleted >= 1)
        .sort((a, b) => b.quizzesCompleted - a.quizzesCompleted)
        .slice(0, 10)
    } catch (error) {
      console.error('Error calculating most active rankings:', error)
      return []
    }
  }

  /**
   * Calculate most improved users
   */
  async calculateMostImprovedRankings() {
    try {
      const allSubmissions = await pocketbaseService.pb.collection('submissions').getFullList({
        expand: 'user,quiz',
        sort: '-created'
      })

      const userMetrics = this.groupSubmissionsByUser(allSubmissions)
      
      return Object.values(userMetrics)
        .map(userData => ({
          userId: userData.userId,
          username: userData.username,
          name: userData.name,
          improvementRate: this.calculateImprovementRate(userData.submissions),
          totalQuizzes: userData.submissions.length,
          averageScore: this.calculateAverage(userData.submissions.map(s => s.score || 0))
        }))
        .filter(user => user.totalQuizzes >= 5) // Need at least 5 quizzes to calculate improvement
        .sort((a, b) => b.improvementRate - a.improvementRate)
        .slice(0, 10)
    } catch (error) {
      console.error('Error calculating most improved rankings:', error)
      return []
    }
  }

  /**
   * Calculate rankings by total points
   */
  async calculateTotalPointsRankings() {
    try {
      const allSubmissions = await pocketbaseService.pb.collection('submissions').getFullList({
        expand: 'user,quiz',
        sort: '-created'
      })

      const userMetrics = this.groupSubmissionsByUser(allSubmissions)
      
      return Object.values(userMetrics)
        .map(userData => ({
          userId: userData.userId,
          username: userData.username,
          name: userData.name,
          totalPoints: userData.submissions.reduce((sum, s) => sum + (s.score || 0), 0),
          totalQuizzes: userData.submissions.length,
          averageScore: this.calculateAverage(userData.submissions.map(s => s.score || 0))
        }))
        .filter(user => user.totalQuizzes >= 1)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 20)
    } catch (error) {
      console.error('Error calculating total points rankings:', error)
      return []
    }
  }

  /**
   * Calculate rankings by unique questions answered correctly
   */
  async calculateUniqueQuestionsRankings() {
    try {
      const allSubmissions = await pocketbaseService.pb.collection('submissions').getFullList({
        expand: 'user,quiz',
        sort: '-created'
      })

      const userMetrics = this.groupSubmissionsByUser(allSubmissions)
      
      return Object.values(userMetrics)
        .map(userData => {
          const questionMetrics = this.calculateQuestionMetrics(userData.submissions)
          return {
            userId: userData.userId,
            username: userData.username,
            name: userData.name,
            uniqueQuestionsAnswered: questionMetrics.uniqueQuestionsAnswered,
            totalQuestionsAttempted: questionMetrics.totalQuestionsAttempted,
            correctAnswers: questionMetrics.correctAnswers,
            accuracyRate: questionMetrics.accuracyRate,
            totalQuizzes: userData.submissions.length
          }
        })
        .filter(user => user.totalQuizzes >= 1)
        .sort((a, b) => b.uniqueQuestionsAnswered - a.uniqueQuestionsAnswered)
        .slice(0, 20)
    } catch (error) {
      console.error('Error calculating unique questions rankings:', error)
      return []
    }
  }

  /**
   * Calculate rankings by accuracy rate
   */
  async calculateAccuracyRankings() {
    try {
      const allSubmissions = await pocketbaseService.pb.collection('submissions').getFullList({
        expand: 'user,quiz',
        sort: '-created'
      })

      const userMetrics = this.groupSubmissionsByUser(allSubmissions)
      
      return Object.values(userMetrics)
        .map(userData => {
          const questionMetrics = this.calculateQuestionMetrics(userData.submissions)
          return {
            userId: userData.userId,
            username: userData.username,
            name: userData.name,
            accuracyRate: questionMetrics.accuracyRate,
            uniqueQuestionsAnswered: questionMetrics.uniqueQuestionsAnswered,
            totalQuestionsAttempted: questionMetrics.totalQuestionsAttempted,
            correctAnswers: questionMetrics.correctAnswers,
            totalQuizzes: userData.submissions.length
          }
        })
        .filter(user => user.totalQuizzes >= 3 && user.totalQuestionsAttempted >= 10) // Minimum threshold for accuracy
        .sort((a, b) => b.accuracyRate - a.accuracyRate)
        .slice(0, 20)
    } catch (error) {
      console.error('Error calculating accuracy rankings:', error)
      return []
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
          avatar: userData?.avatar || null,
          submissions: []
        }
      }
      
      userMetrics[userId].submissions.push(submission)
    })
    
    return userMetrics
  }

  /**
   * Calculate weighted overall score
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

  /**
   * Calculate improvement rate
   */
  calculateImprovementRate(submissions) {
    if (submissions.length < 5) return 0
    
    const sortedSubmissions = submissions.sort((a, b) => new Date(a.created) - new Date(b.created))
    const firstHalf = sortedSubmissions.slice(0, Math.ceil(sortedSubmissions.length / 2))
    const secondHalf = sortedSubmissions.slice(Math.ceil(sortedSubmissions.length / 2))
    
    const firstAvg = this.calculateAverage(firstHalf.map(s => s.score || 0))
    const secondAvg = this.calculateAverage(secondHalf.map(s => s.score || 0))
    
    return Math.round(secondAvg - firstAvg)
  }

  /**
   * Calculate consistency score
   */
  calculateConsistency(submissions) {
    if (submissions.length < 2) return 100
    
    const scores = submissions.map(s => s.score || 0)
    const mean = this.calculateAverage(scores)
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Higher consistency = lower standard deviation
    return Math.max(0, 100 - standardDeviation)
  }

  /**
   * Get recent activity score
   */
  getRecentActivityScore(submissions) {
    if (submissions.length === 0) return 0
    
    const now = new Date()
    const recentSubmissions = submissions.filter(s => {
      const submissionDate = new Date(s.created)
      return (now - submissionDate) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    })
    
    return recentSubmissions.length
  }

  /**
   * Calculate study streak
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
   * Get preferred category
   */
  getPreferredCategory(submissions) {
    if (submissions.length === 0) return 'Unknown'
    
    const categoryCounts = {}
    submissions.forEach(s => {
      const category = s.expand?.quiz?.category
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })
    
    return Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, 'Unknown'
    )
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

    const accuracyRate = totalQuestionsAttempted > 0 ? Math.round((correctAnswers / totalQuestionsAttempted) * 100) : 0

    return {
      uniqueQuestionsAnswered: uniqueQuestions.size,
      totalQuestionsAttempted,
      correctAnswers,
      accuracyRate
    }
  }

  /**
   * Calculate average from array of numbers
   */
  calculateAverage(numbers) {
    if (!numbers || numbers.length === 0) return 0
    return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length)
  }

  /**
   * Get user's current rank
   */
  async getUserRank(userId) {
    try {
      const rankings = await this.calculateOverallRankings()
      const userIndex = rankings.findIndex(u => u.userId === userId)
      return userIndex !== -1 ? userIndex + 1 : 'N/A'
    } catch (error) {
      console.error('Error getting user rank:', error)
      return 'N/A'
    }
  }
}

export const leaderboardService = new LeaderboardService()
