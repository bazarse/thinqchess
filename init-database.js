// Initialize local SQLite database for ThinQ Chess
require('dotenv').config({ path: '.env.local' });
const { initializeDatabase } = require('./lib/database.js');

function main() {
  console.log('🚀 Initializing ThinQ Chess SQLite Database...');

  try {
    initializeDatabase();
    console.log('✅ Database initialization completed successfully!');
    console.log('🎉 You can now run: npm run dev');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Make sure you have write permissions');
    console.log('2. Check if better-sqlite3 is installed: npm install better-sqlite3');
    console.log('3. Try deleting database.sqlite and running again');
    process.exit(1);
  }
}

main();
