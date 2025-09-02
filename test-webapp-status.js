// test-webapp-status.js
// Test the webapp status and provide clear instructions

const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function testWebappStatus() {
  console.log('🚀 Testing Quiz Webapp Status...\n');
  
  try {
    // Test backend connection
    console.log('📡 Testing Backend Connection...');
    await pb.admins.authWithPassword('admin@test.com', 'admin123');
    console.log('✅ Backend (PocketBase) is running on http://localhost:8090');
    
    // Test data availability
    console.log('\n📊 Testing Data Availability...');
    const questions = await pb.collection('questions').getFullList();
    const quizzes = await pb.collection('quizzes').getFullList();
    const users = await pb.collection('users').getFullList();
    
    console.log(`✅ Questions: ${questions.length} available`);
    console.log(`✅ Quizzes: ${quizzes.length} available`);
    console.log(`✅ Users: ${users.length} available`);
    
    // Show available quizzes
    console.log('\n🎯 Available Quizzes:');
    quizzes.forEach(quiz => {
      console.log(`- ${quiz.title} (${quiz.status}) - ${quiz.questions_list?.length || 0} questions`);
    });
    
    // Show available users
    console.log('\n👥 Available Users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role || 'no role'})`);
    });
    
    console.log('\n🎉 Webapp Status: READY FOR TESTING!');
    console.log('\n🌐 Access URLs:');
    console.log('📋 Backend Admin: http://localhost:8090/_/');
    console.log('   - Login: admin@test.com / admin123');
    console.log('   - View collections and data');
    
    console.log('\n🎯 Frontend App: http://localhost:5173/');
    console.log('   - Student: student@test.com / student123');
    console.log('   - Teacher: teacher@test.com / teacher123');
    
    console.log('\n🧪 Testing Instructions:');
    console.log('1. Open http://localhost:5173/ in your browser');
    console.log('2. Login with student@test.com / student123');
    console.log('3. Browse available quizzes');
    console.log('4. Take a quiz and submit');
    console.log('5. Check results and history');
    
    console.log('\n🔧 If you encounter issues:');
    console.log('- Frontend not loading: Make sure npm run dev is running in frontend directory');
    console.log('- Backend errors: Check PocketBase is running on port 8090');
    console.log('- Login issues: Use the test credentials provided above');
    
  } catch (error) {
    console.error('❌ Error testing webapp status:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PocketBase is running: ./pocketbase.exe serve');
    console.log('2. Make sure frontend is running: npm run dev (in frontend directory)');
    console.log('3. Check that sample data is loaded: node create-complete-sample-data.js');
  }
}

testWebappStatus();
