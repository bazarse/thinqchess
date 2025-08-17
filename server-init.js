#!/usr/bin/env node

// Server initialization script for ThinQ Chess
// This ensures the database is properly initialized on server startup

console.log('🚀 ThinQ Chess Server Initialization...');

// Load environment variables
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.local' });

// Import database initialization
const { initializeDatabase } = require('./lib/database.js');

async function initializeServer() {
  try {
    console.log('🔧 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      DEVELOPMENT_MODE: process.env.DEVELOPMENT_MODE,
      DATABASE_TYPE: process.env.DATABASE_TYPE
    });

    // Initialize database
    console.log('📊 Initializing database...');
    await initializeDatabase();
    
    console.log('✅ Server initialization completed successfully!');
    console.log('🎉 ThinQ Chess is ready to serve!');
    
    // Admin credentials info
    console.log('\n🔐 Admin Login Information:');
    console.log('URL: /admin');
    console.log('Username: admin@thinqchess.com OR admin');
    console.log('Password: 1234');
    console.log('\n📝 Note: Change default credentials in production!');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check environment variables');
    console.log('2. Ensure write permissions for database');
    console.log('3. Check server logs for detailed errors');
    process.exit(1);
  }
}

// Run initialization
initializeServer();