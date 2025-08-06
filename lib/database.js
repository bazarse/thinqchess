// Simple SQLite Database for ThinQ Chess
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

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    console.log('✅ SQLite database connected:', DB_PATH);
    
    // Initialize tables if they don't exist
    initializeTables();
  }
  return db;
}

function initializeTables() {
  const database = getDB();
  
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
      tournament_types TEXT DEFAULT '[{"id": "under_8", "name": "Under 8", "fee": 300, "age_min": 5, "age_max": 8, "active": true}, {"id": "under_10", "name": "Under 10", "fee": 350, "age_min": 8, "age_max": 10, "active": true}, {"id": "under_12", "name": "Under 12", "fee": 400, "age_min": 10, "age_max": 12, "active": true}, {"id": "under_16", "name": "Under 16", "fee": 450, "age_min": 12, "age_max": 16, "active": true}, {"id": "open", "name": "Open (Any Age)", "fee": 500, "age_min": null, "age_max": null, "active": true}]',
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

    -- Tournament Registrations Table (Enhanced for Course & Tournament Registrations)
    CREATE TABLE IF NOT EXISTS tournament_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      -- Basic Participant Info
      participant_first_name TEXT NOT NULL,
      participant_middle_name TEXT,
      participant_last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      dob TEXT,
      gender TEXT,
      age INTEGER,

      -- Tournament Specific Fields
      tournament_id INTEGER,
      tournament_type TEXT DEFAULT 'open',
      fide_id TEXT,

      -- Course Specific Fields
      course_type TEXT,
      classes_for TEXT, -- 'Child' or 'Adult'

      -- Parent/Guardian Details (for Child registrations)
      father_first_name TEXT,
      father_middle_name TEXT,
      father_last_name TEXT,
      father_email TEXT,
      father_phone TEXT,
      mother_first_name TEXT,
      mother_middle_name TEXT,
      mother_last_name TEXT,
      mother_email TEXT,
      mother_phone TEXT,

      -- Address Details
      country TEXT,
      country_code TEXT,
      state TEXT,
      city TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      address TEXT, -- Combined address for backward compatibility
      pincode TEXT,

      -- Coaching Preferences (for Course registrations)
      coaching_mode TEXT, -- 'Online' or 'Offline'
      coaching_city TEXT,
      preferred_centre TEXT,

      -- Reference/Source Information
      heard_from TEXT,
      referral_first_name TEXT,
      referral_last_name TEXT,
      other_source TEXT,

      -- Payment & Registration Details
      amount_paid DECIMAL(10,2),
      discount_code TEXT,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      payment_id TEXT,
      razorpay_order_id TEXT,
      payment_status TEXT DEFAULT 'pending',

      -- Type & Timestamps
      type TEXT DEFAULT 'tournament', -- 'tournament' or 'course'
      registered_at TEXT DEFAULT CURRENT_TIMESTAMP,

      -- Terms & Conditions
      terms_condition_one TEXT DEFAULT 'No',
      terms_condition_two TEXT DEFAULT 'No',

      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    );

    -- Demo Requests Table
    CREATE TABLE IF NOT EXISTS demo_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      child_name TEXT NOT NULL,
      age INTEGER,
      past_training TEXT, -- 'Yes' or 'No'
      state TEXT,
      country TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
      demo_completed BOOLEAN DEFAULT 0, -- 0 = No, 1 = Yes
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  // Add new columns to discount_codes table if they don't exist
  try {
    database.exec('ALTER TABLE discount_codes ADD COLUMN email_prefix TEXT');
    console.log('ℹ️ email_prefix column added to discount_codes table');
  } catch (error) {
    console.log('ℹ️ email_prefix column already exists or error adding it');
  }

  try {
    database.exec('ALTER TABLE discount_codes ADD COLUMN match_type TEXT DEFAULT "domain"');
    console.log('ℹ️ match_type column added to discount_codes table');
  } catch (error) {
    console.log('ℹ️ match_type column already exists or error adding it');
  }

  // Add new columns to gallery_images table for video support
  try {
    database.exec('ALTER TABLE gallery_images ADD COLUMN type TEXT DEFAULT "image"');
    console.log('ℹ️ type column added to gallery_images table');
  } catch (error) {
    console.log('ℹ️ type column already exists or error adding it');
  }

  try {
    database.exec('ALTER TABLE gallery_images ADD COLUMN youtube_id TEXT');
    console.log('ℹ️ youtube_id column added to gallery_images table');
  } catch (error) {
    console.log('ℹ️ youtube_id column already exists or error adding it');
  }

  try {
    database.exec('ALTER TABLE gallery_images ADD COLUMN youtube_url TEXT');
    console.log('ℹ️ youtube_url column added to gallery_images table');
  } catch (error) {
    console.log('ℹ️ youtube_url column already exists or error adding it');
  }

  // Create indexes
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

  // Add missing columns if they don't exist
  try {
    database.exec(`
      ALTER TABLE tournament_registrations
      ADD COLUMN tournament_id INTEGER REFERENCES tournaments(id);
    `);
    console.log('✅ Added tournament_id column to tournament_registrations');
  } catch (error) {
    console.log('ℹ️ tournament_id column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN is_active INTEGER DEFAULT 0;
    `);
    console.log('✅ Added is_active column to tournaments');
  } catch (error) {
    console.log('ℹ️ is_active column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN tournament_type TEXT DEFAULT 'open';
    `);
    console.log('✅ Added tournament_type column to tournaments');
  } catch (error) {
    console.log('ℹ️ tournament_type column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN age_min INTEGER;
    `);
    console.log('✅ Added age_min column to tournaments');
  } catch (error) {
    console.log('ℹ️ age_min column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN age_max INTEGER;
    `);
    console.log('✅ Added age_max column to tournaments');
  } catch (error) {
    console.log('ℹ️ age_max column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN flyer_image TEXT;
    `);
    console.log('✅ Added flyer_image column to tournaments');
  } catch (error) {
    console.log('ℹ️ flyer_image column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN registration_start TEXT;
    `);
    console.log('✅ Added registration_start column to tournaments');
  } catch (error) {
    console.log('ℹ️ registration_start column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN registration_end TEXT;
    `);
    console.log('✅ Added registration_end column to tournaments');
  } catch (error) {
    console.log('ℹ️ registration_end column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN categories TEXT DEFAULT '[]';
    `);
    console.log('✅ Added categories column to tournaments');
  } catch (error) {
    console.log('ℹ️ categories column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN registration_start_date TEXT;
    `);
    console.log('✅ Added registration_start_date column to tournaments');
  } catch (error) {
    console.log('ℹ️ registration_start_date column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN registration_end_date TEXT;
    `);
    console.log('✅ Added registration_end_date column to tournaments');
  } catch (error) {
    console.log('ℹ️ registration_end_date column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE tournaments
      ADD COLUMN default_fee DECIMAL(10,2) DEFAULT 500.00;
    `);
    console.log('✅ Added default_fee column to tournaments');
  } catch (error) {
    console.log('ℹ️ default_fee column already exists or error adding it');
  }

  try {
    database.exec(`
      ALTER TABLE gallery_images
      ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ Added created_at column to gallery_images');
  } catch (error) {
    console.log('ℹ️ created_at column already exists or error adding it');
  }

  // Insert default data if tables are empty
  insertDefaultData();

  console.log('✅ Database schema initialized successfully!');
}

function insertDefaultData() {
  const database = getDB();
  
  // Check if admin settings exist
  const adminSettings = database.prepare('SELECT COUNT(*) as count FROM admin_settings').get();
  if (adminSettings.count === 0) {
    // Insert default admin settings
    database.prepare(`
      INSERT INTO admin_settings (
        tournament_fee, registration_fee, max_participants, 
        tournament_registration_active, course_registration_active, coming_soon_message
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(400.00, 500.00, 52, 0, 1, 'Coming Soon! Get ready for the biggest chess tournament of the year!');
    
    console.log('✅ Default admin settings inserted');
  }
  
  // Check if admin user exists
  const adminUsers = database.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (adminUsers.count === 0) {
    // Insert default admin user
    database.prepare(`
      INSERT INTO admin_users (email, password, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('admin@thinqchess.com', '1234', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
    
    console.log('✅ Default admin user created');
  }
  
  // No sample tournaments - admin will create real tournaments
  
  // Insert sample discount codes if none exist
  const discountCodes = database.prepare('SELECT COUNT(*) as count FROM discount_codes').get();
  if (discountCodes.count === 0) {
    const insertDiscount = database.prepare(`
      INSERT INTO discount_codes (code, discount_percent, usage_limit, is_active)
      VALUES (?, ?, ?, ?)
    `);
    
    insertDiscount.run('TC10', 10.00, 50, 1);
    insertDiscount.run('TC20', 20.00, 30, 1);
    insertDiscount.run('STUDENT25', 25.00, 200, 1);
    
    console.log('✅ Sample discount codes inserted');
  }
}

module.exports = {
  getDB,
  initializeTables
};
