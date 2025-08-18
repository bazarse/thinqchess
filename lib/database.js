// Database abstraction layer - Simple File Database
import SimpleDatabase from './simple-db.js';
import path from 'path';

// Database path
const dbPath = path.join(process.cwd(), 'database.sqlite');

// Initialize database
let db;
try {
  db = new SimpleDatabase(dbPath);
  console.log(`✅ Simple database connected: ${dbPath}`);
  
  // Auto-initialize database on server startup
  initializeDatabase();
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
    // Always ensure admin user exists (for server deployments)
    console.log('🔍 Checking for admin user...');
    
    const adminCheck = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
    console.log('Admin check result:', adminCheck);
    
    if (!adminCheck || adminCheck.count === 0) {
      console.log('🔧 Creating default admin user...');
      
      // Create admin user with multiple credential options
      const adminUsers = [
        {
          email: 'admin@thinqchess.com',
          password: '1234',
          role: 'admin'
        },
        {
          email: 'admin',
          password: '1234', 
          role: 'admin'
        }
      ];

      adminUsers.forEach((user, index) => {
        try {
          db.prepare(`
            INSERT INTO admin_users (email, password, password_hash, role)
            VALUES (?, ?, ?, ?)
          `).run(user.email, user.password, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', user.role);
          console.log(`✅ Admin user created: ${user.email}`);
        } catch (err) {
          console.log(`⚠️ Admin user ${user.email} might already exist:`, err.message);
        }
      });
    } else {
      console.log('✅ Admin user already exists');
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

    // Add some sample data for testing
    addSampleData();

  } catch (error) {
    console.error('Error inserting default data:', error);
  }
}

// Add sample data for testing
function addSampleData() {
  try {
    // No default tournaments - let admin create them as needed

    // Add sample discount codes
    const discountCheck = db.prepare('SELECT COUNT(*) as count FROM discount_codes').get();
    if (!discountCheck || discountCheck.count === 0) {
      const sampleCodes = [
        { code: 'WELCOME10', discount_percent: 10, code_type: 'tournament', usage_limit: 100 },
        { code: 'STUDENT20', discount_percent: 20, code_type: 'tournament', usage_limit: 50 },
        { code: 'DEMO50', discount_percent: 50, code_type: 'demo', usage_limit: 25 }
      ];

      sampleCodes.forEach(codeData => {
        try {
          db.prepare(`
            INSERT INTO discount_codes (code, discount_percent, code_type, usage_limit, used_count, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(codeData.code, codeData.discount_percent, codeData.code_type, codeData.usage_limit, 0, 1);
          console.log(`✅ Sample discount code created: ${codeData.code}`);
        } catch (err) {
          console.log(`⚠️ Discount code ${codeData.code} might already exist`);
        }
      });
    }

  } catch (error) {
    console.error('Error adding sample data:', error);
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

export {
  initializeDatabase,
  createTables,
  insertDefaultData,
  getDB,
  db
};
