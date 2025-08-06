// Simple database abstraction layer - JSON Database for Vercel compatibility
const { db } = require('./json-db.js');

// Database initialization
function initializeDatabase() {
  try {
    console.log('🚀 Initializing JSON database...');
    console.log('✅ JSON database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Tables are automatically created by JSON database
function createTables() {
  console.log('✅ Tables ready (JSON database)');
}

// Insert default data (already handled by JSON database)
function insertDefaultData() {
  console.log('✅ Default data ready (JSON database)');
}

// Get database connection (SQLite-compatible interface)
function getDB() {
  return {
    prepare: (query) => ({
      all: (...params) => {
        try {
          return db.prepare(query).all(...params);
        } catch (error) {
          console.error('Query error:', error);
          return [];
        }
      },
      get: (...params) => {
        try {
          return db.prepare(query).get(...params);
        } catch (error) {
          console.error('Query error:', error);
          return null;
        }
      },
      run: (...params) => {
        try {
          return db.prepare(query).run(...params);
        } catch (error) {
          console.error('Query error:', error);
          return { changes: 0, lastInsertRowid: null };
        }
      }
    })
  };
}

module.exports = {
  initializeDatabase,
  createTables,
  insertDefaultData,
  getDB,
  db
};
