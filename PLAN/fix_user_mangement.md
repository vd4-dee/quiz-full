# PocketBase Quiz System Setup - Context Engineering Prompt

## Context & Goal
Thiết lập hệ thống quiz management với PocketBase backend, đảm bảo admin interface tại các URLs sau hoạt động chính xác:
- `http://localhost:8090/_/admin/questions`
- `http://localhost:8090/_/admin/users` 
- `http://localhost:8090/_/admin/quizzes`

## Database Schema Analysis

### Collection: `questions`
**Purpose**: Lưu trữ các câu hỏi quiz với metadata chi tiết

**Required Fields**:
```javascript
{
  questions: string,           // Nội dung câu hỏi
  answers: string[],          // Mảng các lựa chọn đáp án
  correct_answers: number[], // Mảng index của đáp án đúng
  category: string,          // Danh mục (excel, python, pandas)
  sub_category: string,      // Danh mục con (Basic Formulas, VLOOKUP, etc.)
  level: string,            // Độ khó (easy, normal, hard, very hard)
  question_type: string,    // Loại câu hỏi (Single Choice, Multiple Choice)
  explanation: string       // Giải thích đáp án (optional)
}
```

**Field Configurations**:
- `questions`: Text, Required, Min length: 10
- `answers`: JSON, Required, Validation: array with 2-6 items
- `correct_answers`: JSON, Required, Validation: array of numbers
- `category`: Select, Options: ["excel", "python", "pandas"]
- `sub_category`: Text, Required
- `level`: Select, Options: ["easy", "normal", "hard", "very hard"]
- `question_type`: Select, Options: ["Single Choice", "Multiple Choice"]
- `explanation`: Text, Optional

### Collection: `users`
**Purpose**: Quản lý người dùng làm quiz

**Suggested Fields**:
```javascript
{
  username: string,     // Tên đăng nhập
  email: string,       // Email
  name: string,        // Tên hiển thị
  avatar: file,        // Ảnh đại diện
  level: string,       // Trình độ hiện tại
  total_score: number, // Tổng điểm
  quizzes_taken: number, // Số quiz đã làm
  created: datetime,   // Ngày tạo
  updated: datetime    // Ngày cập nhật
}
```

### Collection: `quizzes`
**Purpose**: Lưu trữ kết quả và lịch sử làm quiz

**Suggested Fields**:
```javascript
{
  user: relation(users),           // Người làm quiz
  questions: relation(questions)[], // Các câu hỏi trong quiz
  user_answers: json,             // Đáp án người dùng chọn
  score: number,                  // Điểm số
  total_questions: number,        // Tổng số câu
  correct_answers: number,        // Số câu trả lời đúng
  category: string,              // Danh mục quiz
  level: string,                 // Độ khó
  time_taken: number,            // Thời gian làm bài (seconds)
  completed_at: datetime,        // Thời gian hoàn thành
  created: datetime,             // Thời gian bắt đầu
  updated: datetime              // Cập nhật cuối
}
```

## Setup Instructions

### Step 1: PocketBase Installation & Start
```bash
# Download PocketBase
# Start server
./pocketbase serve --http=127.0.0.1:8090
```

### Step 2: Admin Account Setup
- Navigate to: `http://localhost:8090/_/`
- Create admin account:
  - Email: `admin@test.com`
  - Password: `admin123`

### Step 3: Collection Creation

#### Collection: `questions`
1. **Basic Settings**:
   - Name: `questions`
   - Type: Base
   - List rule: `@request.auth.id != ""`
   - View rule: `@request.auth.id != ""`
   - Create rule: `@request.auth.collectionName = "users"`
   - Update rule: `@request.auth.collectionName = "users"`

2. **Schema Fields**:
   ```
   questions (text, required, min: 10)
   answers (json, required)
   correct_answers (json, required)
   category (select: excel,python,pandas, required)
   sub_category (text, required)
   level (select: easy,normal,hard,very hard, required)
   question_type (select: Single Choice,Multiple Choice, required)
   explanation (text, optional)
   ```

#### Collection: `users`
1. **Basic Settings**:
   - Name: `users`
   - Type: Auth
   - List rule: `id = @request.auth.id`
   - View rule: `id = @request.auth.id`
   - Create rule: `@request.auth.id != ""`
   - Update rule: `id = @request.auth.id`

2. **Additional Schema Fields**:
   ```
   level (select: beginner,intermediate,advanced, default: beginner)
   total_score (number, default: 0)
   quizzes_taken (number, default: 0)
   ```

#### Collection: `quizzes`
1. **Basic Settings**:
   - Name: `quizzes`
   - Type: Base
   - List rule: `user = @request.auth.id`
   - View rule: `user = @request.auth.id`
   - Create rule: `user = @request.auth.id`
   - Update rule: `user = @request.auth.id`

2. **Schema Fields**:
   ```
   user (relation to users, required)
   questions (relation to questions, multiple)
   user_answers (json)
   score (number, default: 0)
   total_questions (number, required)
   correct_answers (number, default: 0)
   category (select: excel,python,pandas)
   level (select: easy,normal,hard,very hard)
   time_taken (number, default: 0)
   completed_at (date)
   ```

### Step 4: Data Population
```bash
npm install pocketbase
node sample-data.js
```

### Step 5: Admin Interface Verification

**Questions Management** (`/admin/questions`):
- ✅ Create/Edit/Delete questions
- ✅ Filter by category, level, question_type
- ✅ Search by question content
- ✅ Bulk operations support
- ✅ JSON field validation for answers/correct_answers

**Users Management** (`/admin/users`):
- ✅ View user profiles and statistics
- ✅ Track quiz progress
- ✅ Manage user permissions
- ✅ Export user data

**Quizzes Management** (`/admin/quizzes`):
- ✅ View all quiz attempts
- ✅ Filter by user, category, date
- ✅ Analytics dashboard
- ✅ Performance reports

## Validation Rules

### Questions Collection
```javascript
// answers validation
answers.length >= 2 && answers.length <= 6

// correct_answers validation  
correct_answers.length >= 1 && 
correct_answers.every(idx => idx >= 0 && idx < answers.length)

// category validation
["excel", "python", "pandas"].includes(category)

// level validation
["easy", "normal", "hard", "very hard"].includes(level)
```

### API Endpoints Structure
```
GET    /api/collections/questions/records     - List questions
POST   /api/collections/questions/records     - Create question
GET    /api/collections/questions/records/:id - Get question
PATCH  /api/collections/questions/records/:id - Update question
DELETE /api/collections/questions/records/:id - Delete question

GET    /api/collections/users/records         - List users
GET    /api/collections/users/records/:id     - Get user

GET    /api/collections/quizzes/records       - List quizzes
POST   /api/collections/quizzes/records       - Create quiz
GET    /api/collections/quizzes/records/:id   - Get quiz
```

## Success Criteria

1. **Admin Interface Access**: All 3 admin pages load without errors
2. **CRUD Operations**: Full Create/Read/Update/Delete functionality
3. **Data Integrity**: Proper validation and relationships
4. **Sample Data**: 35 questions inserted successfully across categories
5. **Search & Filter**: Working filter options in admin interface
6. **Performance**: Fast loading and responsive interface

## Common Issues & Solutions

**Issue**: Admin interface not accessible
**Solution**: Check PocketBase server is running on correct port (8090)

**Issue**: Collections not showing in admin
**Solution**: Verify collections are created with proper permissions

**Issue**: JSON field validation errors
**Solution**: Ensure JSON fields have proper schema validation rules

**Issue**: Sample data insertion fails
**Solution**: Check admin authentication and field name consistency (note: field name is `questions` not `question`)

## Expected Outcomes

After successful setup:
- Admin can manage 35+ sample questions across 3 categories
- Question difficulty distribution: Easy(14), Normal(11), Hard(7), Very Hard(3)
- Categories: Excel(10), Python(15), Pandas(10)
- All admin interfaces fully functional with search, filter, and pagination
- Proper data relationships between users, questions, and quizzes