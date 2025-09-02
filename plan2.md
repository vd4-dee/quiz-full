# CONTEXT-ENGINEERED PROMPTS: REAL DATA STATISTICS IMPLEMENTATION

## 🎯 CONTEXT OVERVIEW
You are a senior full-stack developer converting mock/placeholder statistics pages to use real data from PocketBase. Your task is to implement authentic user statistics, competitive leaderboards, and user profiles using actual quiz submission data and user performance metrics.

**CURRENT STATE:**
- Pages exist but use placeholder/mock data
- Real quiz submissions exist in PocketBase
- User performance data needs aggregation
- Competitive rankings need real calculation

**CRITICAL SUCCESS FACTORS:**
- Statistics reflect actual user performance
- Leaderboard shows real competitive rankings
- Profile displays authentic user data
- Performance calculations are accurate and fast
- Data updates in real-time

---

## 📊 PHASE 1: PERSONAL STATISTICS WITH REAL DATA

### TASK 1.1: Personal Stats Data Integration
**EXACT PROMPT FOR AI:**
```
CONTEXT: Users need to see their actual quiz performance statistics rather than placeholder data. The PersonalStats page must pull real submission data from PocketBase and calculate meaningful analytics.

GOAL: Transform /user/stats into real data-driven personal analytics dashboard

UPDATE: views/user/PersonalStats.vue

REAL DATA REQUIREMENTS:

POCKETBASE DATA SOURCES:
- submissions (user quiz attempts and scores)
- quizzes (quiz metadata and difficulty)
- users (user information and preferences)
- questions (for detailed analysis)

STATISTICS TO CALCULATE FROM REAL DATA:

PERFORMANCE METRICS:
- Overall average score (from all user submissions)
- Total quizzes completed (count of user submissions)
- Best performing category (Excel/Python/Pandas with highest avg)
- Worst performing category (lowest average for improvement focus)
- Score improvement trend (first 5 vs last 5 quizzes)
- Accuracy rate by difficulty level (easy/normal/hard/very hard)

TIME-BASED ANALYTICS:
- Total study time (sum of all quiz durations)
- Average time per quiz (total time / quiz count)
- Most active study hours (time pattern analysis)
- Study frequency (quizzes per day/week/month)
- Fastest quiz completion times
- Time efficiency score (high score in less time)

CATEGORY DEEP DIVE:
- Excel skills breakdown by topic
- Python concept mastery levels  
- Pandas function proficiency
- Cross-category skill correlation
- Knowledge gap identification

PROGRESS TRACKING:
- Score progression timeline (chart showing improvement)
- Streak tracking (consecutive days with quiz activity)
- Goal achievement tracking (if goals set)
- Milestone celebrations (10th quiz, first perfect score, etc.)

DATA FETCHING METHODS:
```javascript
// Required data fetching functions
async getUserSubmissions(userId) {
  // Fetch all submissions for current user with quiz details
}

async calculateCategoryPerformance(userId) {
  // Calculate performance by Excel/Python/Pandas categories
}

async getTimeAnalytics(userId) {
  // Calculate time-based study patterns
}

async getProgressionData(userId) {
  // Get chronological performance data for trends
}

async getComparativeData(userId) {
  // Get anonymized peer comparison data
}
```

CHART IMPLEMENTATIONS:
- Score trend line chart (real performance over time)
- Category performance radar chart (actual category scores)
- Time study heatmap (real study session data)
- Progress timeline (actual milestone achievements)
- Score distribution histogram (real score ranges)

ERROR HANDLING:
- Handle users with no quiz attempts
- Graceful degradation for incomplete data
- Loading states for data calculations
- Error messages for data fetch failures

DELIVERABLE: Personal statistics page using 100% real user data from PocketBase
```

### TASK 1.2: Real-Time Statistics Updates
**EXACT PROMPT FOR AI:**
```
CONTEXT: Personal statistics must update immediately when users complete new quizzes, providing instant feedback on performance changes.

GOAL: Implement real-time statistics updates using PocketBase realtime subscriptions

ENHANCE: PersonalStats.vue with real-time data updates

REAL-TIME FEATURES:

POCKETBASE REALTIME INTEGRATION:
- Subscribe to submissions table changes for current user
- Listen for new quiz completions
- Update statistics automatically when new data arrives
- Maintain subscription lifecycle properly

INSTANT UPDATES:
- Score averages recalculate immediately after new quiz
- Progress charts update with new data points
- Category performance adjusts with latest results
- Time analytics include most recent session
- Ranking position updates if affected

REACTIVE CALCULATIONS:
```javascript
// Real-time calculation patterns
watch(submissions, (newSubmissions) => {
  // Recalculate all statistics when new submission added
  calculateOverallStats()
  updateCategoryPerformance()  
  refreshProgressionData()
  updateComparativeRankings()
})

// Subscription management
onMounted(() => {
  subscribeToUserSubmissions(currentUser.id)
})

onUnmounted(() => {
  unsubscribeFromUserSubmissions()
})
```

PERFORMANCE OPTIMIZATION:
- Debounce rapid calculation updates
- Cache expensive calculations
- Incremental updates instead of full recalculation
- Lazy load non-critical analytics
- Optimize database queries for real-time performance

VISUAL FEEDBACK:
- Smooth chart animations when data updates
- Flash/highlight new statistics briefly
- Progress bar animations for improvements
- Toast notifications for new achievements
- Subtle indicators showing "just updated" data

DELIVERABLE: Real-time updating personal statistics with PocketBase integration
```

---

## 🏆 PHASE 2: COMPETITIVE LEADERBOARD WITH REAL DATA

### TASK 2.1: Real Data Leaderboard Implementation
**EXACT PROMPT FOR AI:**
```
CONTEXT: The leaderboard page must display actual competitive rankings based on real user performance data from quiz submissions. This creates authentic competition and motivation among students.

GOAL: Transform /user/leaderboard into real data-driven competitive ranking system

UPDATE: views/user/Leaderboard.vue

REAL COMPETITIVE DATA:

POCKETBASE QUERIES FOR RANKINGS:
- Aggregate all user submissions for scoring
- Calculate averages, totals, and performance metrics
- Generate rankings across multiple criteria
- Handle ties and edge cases properly

RANKING CATEGORIES WITH REAL DATA:

PERFORMANCE RANKINGS:
- Overall Average Score Leaders (actual calculated averages)
- Total Points Earned (sum of all quiz scores)
- Perfect Score Achievers (100% quiz completions)
- Most Consistent Performers (lowest score variance)
- Category Champions (Excel/Python/Pandas specialists)

ENGAGEMENT RANKINGS:
- Most Active Learners (highest quiz completion count)
- Study Streak Champions (longest consecutive study days)
- Recent Activity Leaders (most quizzes in last 7 days)
- Time Investment Leaders (total study time)
- Quiz Explorer Champions (most diverse quiz attempts)

IMPROVEMENT RANKINGS:
- Most Improved Students (biggest score increase over time)
- Rapid Learners (fastest improvement rate)
- Comeback Champions (biggest recovery from low scores)
- Growth Mindset Heroes (consistent improvement trend)

DATA CALCULATION FUNCTIONS:
```javascript
async function calculateLeaderboardData() {
  // Get all users with quiz submissions
  const allSubmissions = await pb.collection('submissions').getFullList({
    expand: 'user,quiz'
  })
  
  // Group by user and calculate metrics
  const userMetrics = groupSubmissionsByUser(allSubmissions)
  
  // Calculate rankings for each category
  return {
    overallScore: calculateOverallRankings(userMetrics),
    totalPoints: calculatePointRankings(userMetrics),
    mostActive: calculateActivityRankings(userMetrics),
    mostImproved: calculateImprovementRankings(userMetrics),
    categoryChampions: calculateCategoryRankings(userMetrics),
    streakChampions: calculateStreakRankings(userMetrics)
  }
}
```

REAL-TIME UPDATES:
- Subscribe to submissions table changes
- Recalculate rankings when new quiz completed
- Update user positions immediately
- Maintain ranking history for trends

PRIVACY & MOTIVATION:
- Anonymous display options (usernames or "Student #123")
- Highlight current user position prominently
- Show improvement trends for motivation
- Multiple ranking categories for different strengths
- Positive messaging for all participants

FAIR COMPETITION FEATURES:
- Separate rankings by experience level (days since joining)
- Difficulty-weighted scoring (harder quizzes worth more)
- Participation bonuses (points for attempting quizzes)
- Recent performance emphasis (weight recent scores higher)

DELIVERABLE: Authentic competitive leaderboard using real quiz performance data
```

### TASK 2.2: Dynamic Leaderboard Categories
**EXACT PROMPT FOR AI:**
```
CONTEXT: Students learn different subjects at different paces and have various strengths. The leaderboard should recognize diverse achievements using real performance data.

GOAL: Create multiple leaderboard categories that celebrate different types of excellence

ENHANCE: Leaderboard.vue with diverse competitive categories

ADVANCED RANKING CALCULATIONS:

SKILL-BASED RANKINGS (REAL DATA):
```javascript
// Excel Mastery Ranking
async function calculateExcelMastery() {
  const excelSubmissions = await getSubmissionsByCategory('excel')
  return rankUsersByAverageScore(excelSubmissions)
}

// Python Proficiency Ranking  
async function calculatePythonProficiency() {
  const pythonSubmissions = await getSubmissionsByCategory('python')
  return rankUsersByAverageScore(pythonSubmissions)
}

// Pandas Expertise Ranking
async function calculatePandasExpertise() {
  const pandasSubmissions = await getSubmissionsByCategory('pandas')
  return rankUsersByAverageScore(pandasSubmissions)
}

// Well-Rounded Scholar (balanced across all categories)
async function calculateWellRoundedRanking() {
  const userScores = await getCategoryAveragesPerUser()
  return rankByMinimumStandardDeviation(userScores) // lowest variance = most balanced
}
```

EFFORT-BASED RANKINGS (REAL METRICS):
```javascript
// Most Dedicated (actual study time and frequency)
async function calculateDedicationRanking() {
  const userStats = await getUserStudyMetrics()
  return rankByWeightedEngagement(userStats) // time + frequency + consistency
}

// Improvement Champions (actual score progression)
async function calculateImprovementRanking() {
  const progressionData = await getUserProgressionMetrics()
  return rankByImprovementRate(progressionData)
}

// Challenge Seekers (attempts difficult quizzes)
async function calculateChallengeSeekerRanking() {
  const difficultyAttempts = await getUserDifficultyPreferences()
  return rankByDifficultyWeightedScore(difficultyAttempts)
}
```

TIME-BASED COMPETITIONS (REAL DATA):
- Weekly Champions (best average scores this week)
- Monthly Achievers (most improvement this month)
- Streak Leaders (actual consecutive study days)
- Speed Masters (fastest accurate completion times)

DYNAMIC CATEGORIES:
- Beginner Rankings (users with < 10 completed quizzes)
- Intermediate Rankings (10-30 completed quizzes)
- Advanced Rankings (30+ completed quizzes)
- Recent Joiners (account created within last 30 days)

ACHIEVEMENT INTEGRATION:
- Badge Collectors (users with most achievement badges)
- Milestone Masters (users hitting major milestones)
- Goal Achievers (users meeting personal goals)
- Consistency Awards (regular study patterns)

LEADERBOARD FILTERS:
- Time period selection (Last 7 days, 30 days, All time)
- Category filtering (Excel, Python, Pandas, All)
- Experience level filtering (Beginner, Intermediate, Advanced)
- Achievement type filtering (Performance, Effort, Improvement)

MOTIVATION PSYCHOLOGY:
- Multiple ways to appear on leaderboards
- Recognition for different strengths
- Progress-based rankings (not just absolute performance)
- Inclusive competition design
- Celebration of personal achievements

DELIVERABLE: Multi-category leaderboard system recognizing diverse student achievements using real data
```

---

## 👤 PHASE 3: AUTHENTIC USER PROFILE

### TASK 3.1: Real Data User Profile
**EXACT PROMPT FOR AI:**
```
CONTEXT: User profile page must display authentic user information, preferences, and performance summaries using real data from PocketBase rather than placeholder content.

GOAL: Create comprehensive user profile with real data integration

UPDATE: views/user/Profile.vue (or create if doesn't exist)

REAL PROFILE DATA:

USER INFORMATION (FROM POCKETBASE):
- Username and display name
- Email address
- Join date and account age
- Role (student/teacher)
- Profile avatar (if implemented)
- Account preferences and settings

PERFORMANCE SUMMARY (CALCULATED FROM SUBMISSIONS):
- Total quizzes completed (actual count)
- Overall average score (calculated from all submissions)
- Best quiz performance (highest score achieved)
- Current study streak (consecutive days active)
- Total study time invested
- Account creation and first quiz dates

ACHIEVEMENT SHOWCASE (REAL ACCOMPLISHMENTS):
- Earned badges and certificates
- Milestone achievements reached
- Personal records and best performances
- Category mastery levels achieved
- Improvement milestones hit

PROFILE SECTIONS:

ACCOUNT OVERVIEW:
- Personal information display and editing
- Profile picture upload/change
- Username and display name modification
- Email preferences and notifications
- Privacy settings and data sharing preferences

LEARNING PREFERENCES:
- Preferred quiz categories (based on attempt patterns)
- Difficulty level preferences (calculated from choices)
- Study time preferences (when most active)
- Goal setting and tracking
- Learning style preferences

PERFORMANCE HIGHLIGHTS:
- Personal best scores showcase
- Favorite quiz categories (most attempted)
- Improvement journey visualization
- Study habit insights
- Knowledge strength mapping

PRIVACY CONTROLS:
- Leaderboard participation settings
- Data sharing preferences
- Anonymous mode toggles
- Achievement visibility controls
- Statistical sharing permissions

DATA FETCHING FUNCTIONS:
```javascript
async function getUserProfileData(userId) {
  // Get user account information
  const user = await pb.collection('users').getOne(userId)
  
  // Get user's quiz submissions for calculations
  const submissions = await pb.collection('submissions').getFullList({
    filter: `user = "${userId}"`,
    expand: 'quiz'
  })
  
  // Calculate performance metrics
  const stats = calculateUserStatistics(submissions)
  
  // Get achievement data
  const achievements = await getUserAchievements(userId)
  
  return {
    user,
    statistics: stats,
    achievements,
    preferences: await getUserPreferences(userId)
  }
}

function calculateUserStatistics(submissions) {
  return {
    totalQuizzes: submissions.length,
    averageScore: calculateAverage(submissions.map(s => s.score)),
    bestScore: Math.max(...submissions.map(s => s.score)),
    categoryPerformance: groupAndAverageByCategory(submissions),
    improvementTrend: calculateImprovementTrend(submissions),
    studyTime: calculateTotalStudyTime(submissions),
    streakData: calculateStudyStreak(submissions)
  }
}
```

PROFILE EDITING CAPABILITIES:
- Update personal information (name, email)
- Change profile picture
- Modify learning preferences
- Set personal goals
- Adjust privacy settings
- Configure notification preferences

DELIVERABLE: Complete user profile page displaying authentic user data and preferences
```

### TASK 3.2: Profile Settings and Preferences
**EXACT PROMPT FOR AI:**
```
CONTEXT: Users need comprehensive control over their account settings, learning preferences, and privacy options using their actual usage data to provide intelligent defaults.

GOAL: Create intelligent profile settings based on real user behavior

ENHANCE: Profile.vue with intelligent settings management

INTELLIGENT PREFERENCE SYSTEM:

LEARNING PREFERENCES (DATA-DRIVEN):
- Auto-detect preferred quiz categories (most attempted)
- Suggest optimal study times (based on best performance times)
- Recommend difficulty progression (based on success patterns)
- Personalize goal suggestions (based on current performance level)
- Adaptive notification timing (when user is most responsive)

PRIVACY CONTROLS (GRANULAR):
- Leaderboard visibility controls
- Statistical data sharing permissions
- Achievement showcase settings
- Anonymous mode preferences
- Data export controls

NOTIFICATION PREFERENCES:
- Quiz reminder scheduling (based on study patterns)
- Achievement notification settings
- Deadline alert preferences
- Performance update frequency
- Social interaction notifications

GOAL SETTING (SMART DEFAULTS):
```javascript
function generateSmartGoals(userStats) {
  const suggestions = []
  
  // Based on current performance
  if (userStats.averageScore < 70) {
    suggestions.push({
      type: 'score_improvement',
      target: Math.min(userStats.averageScore + 15, 85),
      timeframe: '30 days',
      rationale: 'Achievable improvement based on your progress rate'
    })
  }
  
  // Based on activity patterns
  if (userStats.weeklyQuizzes < 3) {
    suggestions.push({
      type: 'activity_increase', 
      target: Math.min(userStats.weeklyQuizzes + 2, 5),
      timeframe: '2 weeks',
      rationale: 'Gradual increase for sustainable learning'
    })
  }
  
  // Based on category performance
  const weakestCategory = findWeakestCategory(userStats)
  if (weakestCategory.score < userStats.averageScore - 10) {
    suggestions.push({
      type: 'category_focus',
      target: weakestCategory.name,
      improvement: 20,
      rationale: 'Strengthen your weakest area for balanced skills'
    })
  }
  
  return suggestions
}
```

DATA INSIGHTS FOR SETTINGS:
- Study pattern analysis for optimal scheduling
- Performance correlation with study times
- Category preference based on success rates
- Social interaction preferences from behavior
- Learning style indicators from quiz approach

ACCOUNT MANAGEMENT:
- Password change functionality
- Email update with verification
- Account deactivation options
- Data export requests
- Account deletion procedures (GDPR compliant)

EXPORT CAPABILITIES:
- Personal performance report (PDF)
- Raw data export (CSV/JSON)
- Achievement certificate generation
- Progress timeline export
- Study recommendations report

COMPONENTS TO CREATE:
1. IntelligentGoalSetting.vue - smart goal suggestions based on data
2. PrivacyControlPanel.vue - granular privacy management
3. NotificationManager.vue - intelligent notification preferences  
4. DataInsights.vue - behavioral analysis for settings
5. AccountSecurity.vue - password and security settings
6. DataExportTools.vue - user data export functionality

DELIVERABLE: Intelligent profile settings system using real user behavior data
```

---

## 🏅 PHASE 3: REAL DATA LEADERBOARD SYSTEM

### TASK 3.1: Authentic Competitive Rankings
**EXACT PROMPT FOR AI:**
```
CONTEXT: The leaderboard must show real competitive rankings based on actual quiz performance data, creating authentic motivation through genuine achievement recognition.

GOAL: Implement competitive leaderboard using real submission data from PocketBase

UPDATE: views/user/Leaderboard.vue

REAL COMPETITIVE CALCULATIONS:

OVERALL RANKING ALGORITHM:
```javascript
async function calculateOverallRankings() {
  // Get all users with submissions
  const allUsers = await pb.collection('users').getFullList({
    filter: 'role = "student"' // Only rank students
  })
  
  const rankings = []
  
  for (const user of allUsers) {
    const submissions = await getUserSubmissions(user.id)
    if (submissions.length === 0) continue // Skip users with no attempts
    
    const userStats = {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      totalQuizzes: submissions.length,
      averageScore: calculateAverage(submissions.map(s => s.score)),
      totalPoints: submissions.reduce((sum, s) => sum + s.score, 0),
      improvementRate: calculateImprovementRate(submissions),
      consistencyScore: calculateConsistency(submissions),
      recentActivity: getRecentActivityScore(submissions)
    }
    
    // Weighted overall score calculation
    userStats.overallRank = calculateWeightedScore(userStats)
    rankings.push(userStats)
  }
  
  return rankings.sort((a, b) => b.overallRank - a.overallRank)
}
```

CATEGORY-SPECIFIC RANKINGS:
- Excel Champions (real Excel quiz performance)
- Python Masters (actual Python quiz scores)  
- Pandas Experts (genuine Pandas quiz results)
- Cross-Category Leaders (balanced performance across all subjects)

TIME-BASED COMPETITIONS:
- This Week's Stars (actual performance from last 7 days)
- Monthly Champions (real monthly performance data)
- Improvement This Month (actual score increases)
- Most Active This Week (real quiz completion counts)

FAIR RANKING FEATURES:
- Experience level groupings (beginners vs advanced)
- Minimum quiz requirements (must complete 5+ quizzes to rank)
- Difficulty-weighted scoring (hard quizzes worth more points)
- Participation bonuses (points for attempting challenging quizzes)
- Anti-gaming measures (detect and handle suspicious patterns)

REAL-TIME LEADERBOARD UPDATES:
- Subscribe to submissions table changes
- Recalculate affected rankings immediately
- Animate position changes smoothly
- Notify users of ranking improvements
- Update badges and achievements instantly

MOTIVATION PSYCHOLOGY:
- Multiple ranking categories (everyone can excel somewhere)
- Personal improvement focus alongside absolute rankings
- Recognition for effort and consistency, not just scores
- Beginner-friendly separate rankings
- Growth celebration over just achievement

DELIVERABLE: Authentic competitive leaderboard based on real user performance data
```

### TASK 3.2: Advanced Competitive Analytics
**EXACT PROMPT FOR AI:**
```
CONTEXT: Competitive analytics should provide deep insights into real performance patterns, helping users understand their competitive position and improvement opportunities.

GOAL: Create sophisticated competitive analytics using real submission data

CREATE: Advanced competitive analysis components

COMPETITIVE INSIGHTS USING REAL DATA:

POSITION ANALYSIS:
```javascript
async function getUserCompetitivePosition(userId) {
  const allRankings = await calculateOverallRankings()
  const userPosition = allRankings.findIndex(u => u.userId === userId) + 1
  const totalUsers = allRankings.length
  const percentile = ((totalUsers - userPosition) / totalUsers) * 100
  
  return {
    currentRank: userPosition,
    totalCompetitors: totalUsers,
    percentileRank: Math.round(percentile),
    pointsToNextRank: calculatePointsToAdvance(userId, allRankings),
    rankingTrend: await calculateRankingTrend(userId),
    strengthCategories: await identifyCompetitiveStrengths(userId),
    improvementOpportunities: await identifyCompetitiveWeaknesses(userId)
  }
}
```

PEER COMPARISON (ANONYMIZED):
- Performance vs similar-level students
- Category strength comparison with anonymized peers
- Improvement rate vs average improvement rate
- Study pattern comparison (time investment vs results)
- Efficiency ranking (score per time invested)

COMPETITIVE OPPORTUNITY IDENTIFICATION:
- Rankings where user could improve most easily
- Categories where user is close to next achievement level
- Time investment opportunities for ranking advancement
- Skill development priorities for competitive advantage

ACHIEVEMENT PREDICTION:
- Predict when user might reach next ranking tier
- Estimate quiz attempts needed for specific achievements  
- Calculate probability of reaching certain percentiles
- Forecast potential for category leadership
- Timeline for skill mastery based on current progress

COMPETITIVE WELLNESS:
- Monitor for unhealthy competitive behavior
- Encourage balanced learning over just ranking
- Promote collaboration opportunities
- Provide perspective on ranking relative to learning goals
- Emphasize personal growth alongside competitive achievement

SOCIAL COMPETITIVE FEATURES:
- Study group competitive challenges
- Collaborative quiz attempts (if implemented)
- Peer encouragement systems
- Team competitions and group rankings
- Mentorship matching based on complementary strengths

COMPONENTS TO CREATE:
1. CompetitivePositionAnalysis.vue - detailed ranking analysis
2. PeerComparisonWidget.vue - anonymized peer performance comparison
3. OpportunityIdentifier.vue - improvement opportunity suggestions
4. AchievementPredictor.vue - forecasting competitive achievements
5. CompetitiveWellness.vue - healthy competition monitoring
6. SocialCompetition.vue - collaborative competitive features

ETHICAL CONSIDERATIONS:
- Prevent ranking obsession
- Celebrate effort alongside achievement
- Provide perspective on learning vs competition
- Monitor for negative competitive effects
- Promote healthy goal setting

DELIVERABLE: Sophisticated competitive analytics promoting healthy competition and learning
```

---

## 🔄 PHASE 4: DATA SYNCHRONIZATION & PERFORMANCE

### TASK 4.1: Efficient Data Management
**EXACT PROMPT FOR AI:**
```
CONTEXT: With real data integration across three major pages (stats, leaderboard, profile), efficient data management and caching strategies are crucial for optimal performance.

GOAL: Implement optimized data fetching and caching for statistics pages

CREATE: services/statisticsDataManager.js

PERFORMANCE OPTIMIZATION STRATEGY:

DATA CACHING SYSTEM:
```javascript
class StatisticsDataManager {
  constructor() {
    this.cache = new Map()
    this.subscriptions = new Map()
    this.refreshIntervals = new Map()
  }
  
  // Intelligent caching with TTL
  async getUserStats(userId, forceRefresh = false) {
    const cacheKey = `user_stats_${userId}`
    
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data
    }
    
    const stats = await this.calculateUserStatistics(userId)
    this.setCache(cacheKey, stats, 300) // 5-minute TTL
    return stats
  }
  
  // Real-time updates with smart batching
  subscribeToUserDataChanges(userId, callback) {
    const subscription = pb.collection('submissions').subscribe('*', (e) => {
      if (e.record.user === userId) {
        this.invalidateUserCache(userId)
        this.debouncedRefresh(userId, callback)
      }
    })
    
    this.subscriptions.set(userId, subscription)
  }
}
```

EFFICIENT CALCULATION STRATEGIES:
- Incremental statistics updates (don't recalculate everything)
- Batch processing for multiple users
- Background calculation for expensive operations
- Smart query optimization with proper indexes
- Result memoization for repeated calculations

REAL-TIME OPTIMIZATION:
- Debounced updates to prevent excessive recalculation
- Smart subscription management
- Selective component updates (only affected sections)
- Lazy loading for non-critical statistics
- Progressive data loading for large datasets

DATA FRESHNESS MANAGEMENT:
- Critical data (current user): Update immediately
- Leaderboard data: Update every 5 minutes
- Historical trends: Update daily
- Archive data: Calculate on-demand
- Social comparisons: Update hourly

MEMORY MANAGEMENT:
- Automatic cache cleanup
- Subscription cleanup on component unmount
- Memory leak prevention
- Efficient data structures
- Garbage collection optimization

DELIVERABLE: High-performance data management system for real-time statistics
```

### TASK 4.2: Cross-Page Data Consistency
**EXACT PROMPT FOR AI:**
```
CONTEXT: Statistics data must remain consistent across all three pages (stats, leaderboard, profile) while maintaining real-time accuracy and optimal performance.

GOAL: Ensure data consistency and synchronization across statistics pages

CREATE: Data synchronization system for statistics pages

CONSISTENCY REQUIREMENTS:

SHARED DATA STATE:
```javascript
// Centralized statistics store
const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    userStats: null,
    leaderboardData: null,
    profileData: null,
    lastUpdated: null,
    isCalculating: false
  }),
  
  actions: {
    async refreshAllUserData(userId) {
      this.isCalculating = true
      
      // Parallel data fetching for efficiency
      const [stats, rankings, profile] = await Promise.all([
        this.calculatePersonalStats(userId),
        this.getUserRankingData(userId),
        this.getUserProfileData(userId)
      ])
      
      // Update all data atomically
      this.userStats = stats
      this.leaderboardData = rankings
      this.profileData = profile
      this.lastUpdated = new Date()
      this.isCalculating = false
    }
  }
})
```

SYNCHRONIZATION PATTERNS:
- Single source of truth for user statistics
- Coordinated updates across all pages
- Event-driven data refresh
- Optimistic updates with rollback capability
- Cross-page navigation state preservation

REAL-TIME CONSISTENCY:
- Broadcast updates to all open statistics pages
- Immediate reflection of new quiz completions
- Synchronized leaderboard position updates
- Instant achievement unlock notifications
- Coordinated ranking change animations

DATA VALIDATION:
- Cross-reference calculations between pages
- Validate ranking consistency
- Verify statistical accuracy
- Check for data anomalies
- Monitor calculation performance

NAVIGATION PRESERVATION:
- Maintain data when switching between statistics pages
- Preserve filters and view states
- Keep calculation results during navigation
- Maintain scroll positions and selections
- Smart prefetching for anticipated navigation

COMPONENTS TO CREATE:
1. StatisticsStore.vue - centralized statistics state management
2. DataSynchronizer.vue - cross-page data consistency
3. CalculationValidator.vue - data accuracy verification
4. NavigationPreserver.vue - state preservation during navigation
5. PerformanceMonitor.vue - calculation performance tracking

ERROR HANDLING:
- Graceful degradation for calculation failures
- Retry mechanisms for failed data fetches
- User feedback for data inconsistencies
- Fallback displays for missing data
- Recovery procedures for corrupted statistics

DELIVERABLE: Synchronized statistics system with consistent real data across all pages
```

---

## 🎯 IMPLEMENTATION PRIORITY ORDER

**IMMEDIATE DEVELOPMENT (Execute First):**
1. **Task 1.1** - Personal Stats Real Data Integration
2. **Task 3.1** - Real Data User Profile  
3. **Task 2.1** - Authentic Competitive Rankings

**ENHANCEMENT PHASE (Execute Second):**
4. **Task 1.2** - Real-Time Statistics Updates
5. **Task 2.2** - Dynamic Leaderboard Categories
6. **Task 3.2** - Profile Settings and Preferences

**OPTIMIZATION PHASE (Execute Third):**
7. **Task 4.1** - Efficient Data Management
8. **Task 4.2** - Cross-Page Data Consistency

---

## 🚨 CRITICAL SUCCESS CRITERIA

**DATA AUTHENTICITY:**
- [ ] All statistics calculated from real PocketBase submissions
- [ ] No placeholder or mock data visible
- [ ] Accurate calculations verified against database
- [ ] Real-time updates working correctly

**PERFORMANCE REQUIREMENTS:**
- [ ] Statistics pages load in < 3 seconds
- [ ] Calculations complete in < 1 second
- [ ] Real-time updates appear within 2 seconds
- [ ] No performance degradation with real data

**USER EXPERIENCE:**
- [ ] Consistent data across all three pages
- [ ] Smooth navigation between statistics sections
- [ ] Meaningful competitive insights
- [ ] Motivational rather than discouraging competition

**TECHNICAL QUALITY:**
- [ ] Efficient database queries
- [ ] Proper error handling for edge cases
- [ ] Memory-efficient calculation algorithms
- [ ] Scalable for growing user base

Use these context-engineered prompts to systematically convert your statistics pages to use real data while maintaining optimal performance and user experience.