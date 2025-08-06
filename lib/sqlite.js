// SQLite Database Configuration and Connection
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'thinqchess.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
let db = null;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Set journal mode to WAL for better performance
    db.pragma('journal_mode = WAL');
    
    console.log('✅ SQLite database connected:', DB_PATH);
  }
  
  return db;
}

// Initialize database with schema
function initializeDatabase() {
  const database = getDatabase();
  
  console.log('🔧 Initializing database schema...');
  
  // Create all tables
  const schema = `
    -- Admin Settings Table
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_fee DECIMAL(10,2) DEFAULT 400.00,
      registration_fee DECIMAL(10,2) DEFAULT 500.00,
      max_participants INTEGER DEFAULT 52,
      countdown_end_date TEXT,
      tournament_registration_active BOOLEAN DEFAULT 0,
      tournament_registration_mode TEXT DEFAULT 'manual',
      tournament_open_date TEXT,
      tournament_close_date TEXT,
      tournament_closed_message TEXT DEFAULT 'Registration is currently closed. Please check back later.',
      course_registration_active BOOLEAN DEFAULT 1,
      coming_soon_message TEXT DEFAULT 'Coming Soon! New tournament season starting soon.',
      tournament_types TEXT DEFAULT '[
        {"id": "under_8", "name": "Under 8", "fee": 300, "age_min": 5, "age_max": 8, "active": true},
        {"id": "under_10", "name": "Under 10", "fee": 350, "age_min": 8, "age_max": 10, "active": true},
        {"id": "under_12", "name": "Under 12", "fee": 400, "age_min": 10, "age_max": 12, "active": true},
        {"id": "under_16", "name": "Under 16", "fee": 450, "age_min": 12, "age_max": 16, "active": true},
        {"id": "open", "name": "Open (Any Age)", "fee": 500, "age_min": null, "age_max": null, "active": true}
      ]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Tournaments Table
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      registration_start_date TEXT,
      registration_end_date TEXT,
      fee DECIMAL(10,2) DEFAULT 500.00,
      max_participants INTEGER DEFAULT 50,
      status TEXT DEFAULT 'upcoming',
      venue TEXT,
      rules TEXT,
      prizes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Tournament Registrations Table
    CREATE TABLE IF NOT EXISTS tournament_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_first_name TEXT NOT NULL,
      participant_last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      dob TEXT,
      gender TEXT,
      tournament_type TEXT DEFAULT 'open',
      country TEXT,
      state TEXT,
      city TEXT,
      address TEXT,
      amount_paid DECIMAL(10,2),
      discount_code TEXT,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      payment_id TEXT,
      razorpay_order_id TEXT,
      payment_status TEXT DEFAULT 'pending',
      type TEXT DEFAULT 'tournament',
      registered_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Registrations Table (for tournament-specific registrations)
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER,
      participant_first_name TEXT NOT NULL,
      participant_last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      dob TEXT,
      gender TEXT,
      tournament_type TEXT DEFAULT 'open',
      country TEXT,
      state TEXT,
      city TEXT,
      address TEXT,
      amount_paid DECIMAL(10,2),
      discount_code TEXT,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      payment_id TEXT,
      razorpay_order_id TEXT,
      payment_status TEXT DEFAULT 'pending',
      registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    );

    -- Admin Users Table
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      password_hash TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Discount Codes Table
    CREATE TABLE IF NOT EXISTS discount_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_percent DECIMAL(5,2) NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      usage_limit INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      code_type TEXT DEFAULT 'manual',
      prefix TEXT,
      email_domain TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Gallery Images Table
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT DEFAULT 'uncategorized',
      display_order INTEGER DEFAULT 0,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Blogs Table
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      slug TEXT UNIQUE NOT NULL,
      author TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'draft',
      tags TEXT,
      featured_image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Execute schema
  database.exec(schema);
  
  // Create indexes for better performance
  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
    CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
    CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery_images(display_order);
    CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
    CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
    CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(payment_status);
    CREATE INDEX IF NOT EXISTS idx_tournament_registrations_date ON tournament_registrations(registered_at);
    CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations(tournament_id);
    CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
  `;
  
  database.exec(indexes);
  
  console.log('✅ Database schema initialized successfully!');
  
  return database;
}

// Close database connection
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('🔒 Database connection closed');
  }
}

// Export functions
module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  db
};
