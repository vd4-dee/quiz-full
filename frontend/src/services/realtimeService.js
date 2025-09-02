// services/realtimeService.js
import pocketbaseService from './pocketbase'

class RealtimeService {
  constructor() {
    this.subscriptions = new Map()
    this.callbacks = new Map()
  }

  /**
   * Subscribe to user submissions changes
   */
  subscribeToUserSubmissions(userId, callback) {
    if (this.subscriptions.has(userId)) {
      this.unsubscribeFromUserSubmissions(userId)
    }

    try {
      const subscription = pocketbaseService.pb.collection('submissions').subscribe('*', (e) => {
        if (e.record.user === userId) {
          console.log('User submission updated:', e)
          this.handleSubmissionUpdate(userId, e)
        }
      })

      this.subscriptions.set(userId, subscription)
      this.callbacks.set(userId, callback)

      console.log(`Subscribed to submissions for user: ${userId}`)
    } catch (error) {
      console.error('Error subscribing to submissions:', error)
    }
  }

  /**
   * Unsubscribe from user submissions
   */
  unsubscribeFromUserSubmissions(userId) {
    const subscription = this.subscriptions.get(userId)
    if (subscription) {
      try {
        subscription.unsubscribe()
        this.subscriptions.delete(userId)
        this.callbacks.delete(userId)
        console.log(`Unsubscribed from submissions for user: ${userId}`)
      } catch (error) {
        console.error('Error unsubscribing from submissions:', error)
      }
    }
  }

  /**
   * Handle submission updates
   */
  handleSubmissionUpdate(userId, event) {
    const callback = this.callbacks.get(userId)
    if (callback) {
      // Debounce the callback to prevent excessive updates
      this.debounceCallback(userId, callback, event)
    }
  }

  /**
   * Debounce callback execution
   */
  debounceCallback(userId, callback, event) {
    if (this.debounceTimers.has(userId)) {
      clearTimeout(this.debounceTimers.get(userId))
    }

    const timer = setTimeout(() => {
      callback(event)
    }, 500) // 500ms debounce

    this.debounceTimers.set(userId, timer)
  }

  /**
   * Subscribe to leaderboard updates
   */
  subscribeToLeaderboardUpdates(callback) {
    try {
      const subscription = pocketbaseService.pb.collection('submissions').subscribe('*', (e) => {
        console.log('Leaderboard update triggered:', e)
        this.debounceCallback('leaderboard', callback, e)
      })

      this.subscriptions.set('leaderboard', subscription)
      this.callbacks.set('leaderboard', callback)

      console.log('Subscribed to leaderboard updates')
    } catch (error) {
      console.error('Error subscribing to leaderboard updates:', error)
    }
  }

  /**
   * Unsubscribe from leaderboard updates
   */
  unsubscribeFromLeaderboardUpdates() {
    this.unsubscribeFromUserSubmissions('leaderboard')
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    for (const [userId, subscription] of this.subscriptions) {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.error(`Error cleaning up subscription for ${userId}:`, error)
      }
    }
    
    this.subscriptions.clear()
    this.callbacks.clear()
    
    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
  }

  // Debounce timers storage
  debounceTimers = new Map()
}

export const realtimeService = new RealtimeService()
