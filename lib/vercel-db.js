// Vercel-compatible SQLite database with pre-populated data
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function initializeVercelDB() {
  try {
    // Use memory database for Vercel (read-only)
    db = new Database(':memory:');
    
    // Create all tables
    createTables();
    
    // Insert sample data for demo
    insertSampleData();
    
    console.log('✅ Vercel SQLite database initialized with sample data');
    return db;
  } catch (error) {
    console.error('❌ Error initializing Vercel database:', error);
    throw error;
  }
}

function createTables() {
  // Admin Settings Table
  db.exec(`
    CREATE TABLE admin_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_fee REAL DEFAULT 500.00,
      registration_fee REAL DEFAULT 400.00,
      max_participants INTEGER DEFAULT 50,
      tournament_registration_active INTEGER DEFAULT 1,
      course_registration_active INTEGER DEFAULT 1,
      coming_soon_message TEXT DEFAULT 'Coming Soon! New tournament season starting soon.',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tournaments Table
  db.exec(`
    CREATE TABLE tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      registration_start_date TEXT,
      registration_end_date TEXT,
      fee REAL DEFAULT 500.00,
      max_participants INTEGER DEFAULT 50,
      status TEXT DEFAULT 'upcoming',
      is_active INTEGER DEFAULT 0,
      categories TEXT DEFAULT '[]',
      flyer_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tournament Registrations Table
  db.exec(`
    CREATE TABLE tournament_registrations (
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
      amount_paid REAL,
      payment_status TEXT DEFAULT 'completed',
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin Users Table
  db.exec(`
    CREATE TABLE admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      password_hash TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Discount Codes Table
  db.exec(`
    CREATE TABLE discount_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value REAL NOT NULL,
      usage_limit INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Blogs Table
  db.exec(`
    CREATE TABLE blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      slug TEXT UNIQUE NOT NULL,
      author TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'published',
      featured_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function insertSampleData() {
  // Insert admin user
  db.prepare(`
    INSERT INTO admin_users (email, password, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run('admin@thinqchess.com', '1234', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

  // Insert admin settings
  db.prepare(`
    INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants)
    VALUES (?, ?, ?)
  `).run(500.00, 400.00, 50);

  // Insert sample tournament
  const tournamentId = db.prepare(`
    INSERT INTO tournaments (name, description, start_date, end_date, status, is_active, fee)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'ThinQ Chess Championship 2024',
    'Annual chess championship for all age groups',
    '2024-12-25',
    '2024-12-26',
    'upcoming',
    1,
    500.00
  ).lastInsertRowid;

  // Insert sample registrations
  const sampleRegistrations = [
    ['Arjun', 'Sharma', 'arjun@email.com', '+91-9876543210', '2010-05-15', 'Male', 'India', 'Maharashtra', 'Mumbai'],
    ['Priya', 'Patel', 'priya@email.com', '+91-9876543211', '2008-08-20', 'Female', 'India', 'Gujarat', 'Ahmedabad'],
    ['Rahul', 'Kumar', 'rahul@email.com', '+91-9876543212', '2012-03-10', 'Male', 'India', 'Delhi', 'New Delhi'],
    ['Sneha', 'Singh', 'sneha@email.com', '+91-9876543213', '2009-11-25', 'Female', 'India', 'Uttar Pradesh', 'Lucknow'],
    ['Vikram', 'Gupta', 'vikram@email.com', '+91-9876543214', '2011-07-18', 'Male', 'India', 'Rajasthan', 'Jaipur']
  ];

  const insertRegistration = db.prepare(`
    INSERT INTO tournament_registrations 
    (tournament_id, participant_first_name, participant_last_name, email, phone, dob, gender, country, state, city, amount_paid, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleRegistrations.forEach(reg => {
    insertRegistration.run(tournamentId, ...reg, 500.00, 'completed');
  });

  // Insert discount codes
  db.prepare(`
    INSERT INTO discount_codes (code, discount_type, discount_value, usage_limit)
    VALUES (?, ?, ?, ?)
  `).run('DEMO10', 'percentage', 10, 100);

  // Insert sample blog
  db.prepare(`
    INSERT INTO blogs (title, content, excerpt, slug, status, featured_image)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Welcome to ThinQ Chess Academy',
    'Welcome to our premier chess academy! We provide world-class chess training for players of all levels. Our expert coaches will help you improve your game and achieve your chess goals.',
    'Join our chess academy for expert training and tournaments.',
    'welcome-to-thinq-chess',
    'published',
    '/images/chess-banner.jpg'
  );

  console.log('✅ Sample data inserted successfully');
}

// Export for Vercel
if (process.env.NODE_ENV === 'production') {
  db = initializeVercelDB();
}

module.exports = { initializeVercelDB, db };
