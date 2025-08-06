// Database abstraction layer - Simple File Database
const SimpleDatabase = require('./simple-db.js');
const path = require('path');

// Database path
const dbPath = path.join(process.cwd(), 'database.sqlite');

// Initialize database
let db;
try {
  db = new SimpleDatabase(dbPath);
  console.log(`✅ Simple database connected: ${dbPath}`);
} catch (error) {
  console.error('❌ Database connection failed:', error);
  throw error;
}

// Database initialization
function initializeDatabase() {
  try {
    console.log('🚀 Initializing Simple database...');

    // Create tables if they don't exist
    createTables();
    insertDefaultData();

    console.log('✅ Simple database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Create tables
function createTables() {
  try {
    // Tables are automatically created by the simple database
    console.log('✅ All tables ready');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Insert default data
function insertDefaultData() {
  try {
    // Check if admin user exists
    const adminCheck = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
    if (!adminCheck || adminCheck.count === 0) {
      db.prepare(`
        INSERT INTO admin_users (email, password, password_hash, role)
        VALUES (?, ?, ?, ?)
      `).run('admin@thinqchess.com', '1234', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
      console.log('✅ Default admin user created');
    }

    // Check if admin settings exist
    const settingsCheck = db.prepare('SELECT COUNT(*) as count FROM admin_settings').get();
    if (!settingsCheck || settingsCheck.count === 0) {
      db.prepare(`
        INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants)
        VALUES (?, ?, ?)
      `).run(500.00, 400.00, 50);
      console.log('✅ Default admin settings created');
    }
  } catch (error) {
    console.error('Error inserting default data:', error);
  }
}

// Get database connection (SQLite interface)
function getDB() {
  return {
    prepare: (query) => ({
      all: (...params) => {
        try {
          return db.prepare(query).all(...params);
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      get: (...params) => {
        try {
          return db.prepare(query).get(...params);
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      run: (...params) => {
        try {
          return db.prepare(query).run(...params);
        } catch (error) {
          console.error('Query error:', error);
          throw error;
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
