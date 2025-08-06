// Database abstraction layer - PostgreSQL for both local and Vercel
const { sql } = require('@vercel/postgres');

// Database initialization
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing PostgreSQL database...');

    // Create tables if they don't exist
    await createTables();
    await insertDefaultData();

    console.log('✅ PostgreSQL database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

async function createTables() {
  try {
    // Admin Settings Table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        tournament_fee DECIMAL(10,2) DEFAULT 500.00,
        registration_fee DECIMAL(10,2) DEFAULT 400.00,
        max_participants INTEGER DEFAULT 50,
        countdown_end_date TEXT,
        tournament_registration_active BOOLEAN DEFAULT true,
        tournament_registration_mode TEXT DEFAULT 'manual',
        tournament_open_date TEXT,
        tournament_close_date TEXT,
        tournament_closed_message TEXT DEFAULT 'Registration is currently closed. Please check back later.',
        course_registration_active BOOLEAN DEFAULT true,
        coming_soon_message TEXT DEFAULT 'Coming Soon! New tournament season starting soon.',
        tournament_types TEXT DEFAULT '[{"id": "under_8", "name": "Under 8", "fee": 300, "age_min": 5, "age_max": 8, "active": true}, {"id": "under_10", "name": "Under 10", "fee": 350, "age_min": 8, "age_max": 10, "active": true}, {"id": "under_12", "name": "Under 12", "fee": 400, "age_min": 10, "age_max": 12, "active": true}, {"id": "under_16", "name": "Under 16", "fee": 450, "age_min": 12, "age_max": 16, "active": true}, {"id": "open", "name": "Open (Any Age)", "fee": 500, "age_min": null, "age_max": null, "active": true}]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Tournaments Table
    await sql`
      CREATE TABLE IF NOT EXISTS tournaments (
        id SERIAL PRIMARY KEY,
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
        is_active BOOLEAN DEFAULT false,
        categories TEXT DEFAULT '[]',
        flyer_image TEXT,
        default_fee DECIMAL(10,2) DEFAULT 500.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Tournament Registrations Table
    await sql`
      CREATE TABLE IF NOT EXISTS tournament_registrations (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id),
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
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        terms_condition_one TEXT DEFAULT 'No',
        terms_condition_two TEXT DEFAULT 'No'
      )
    `;

    // Registrations Table (Enhanced for Course & Tournament Registrations)
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
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
        type TEXT DEFAULT 'tournament',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        terms_condition_one TEXT DEFAULT 'No',
        terms_condition_two TEXT DEFAULT 'No'
      )
    `;

    // Demo Requests Table
    await sql`
      CREATE TABLE IF NOT EXISTS demo_requests (
        id SERIAL PRIMARY KEY,
        parent_name TEXT NOT NULL,
        child_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        age INTEGER NOT NULL,
        chess_experience TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Admin Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        password_hash TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Discount Codes Table
    await sql`
      CREATE TABLE IF NOT EXISTS discount_codes (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT DEFAULT 'percentage',
        discount_value DECIMAL(10,2) NOT NULL,
        max_uses INTEGER DEFAULT 1,
        used_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        email_prefix TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `;

    // Gallery Images Table
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Blogs Table
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        slug TEXT UNIQUE NOT NULL,
        author TEXT DEFAULT 'Admin',
        status TEXT DEFAULT 'draft',
        tags TEXT,
        featured_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ All PostgreSQL tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Insert default data
async function insertDefaultData() {
  try {
    // Check if admin user exists
    const adminCheck = await sql`SELECT COUNT(*) as count FROM admin_users`;
    if (adminCheck.rows[0].count === 0) {
      await sql`
        INSERT INTO admin_users (email, password, password_hash, role)
        VALUES ('admin@thinqchess.com', '1234', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      `;
      console.log('✅ Default admin user created');
    }

    // Check if admin settings exist
    const settingsCheck = await sql`SELECT COUNT(*) as count FROM admin_settings`;
    if (settingsCheck.rows[0].count === 0) {
      await sql`
        INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants)
        VALUES (500.00, 400.00, 50)
      `;
      console.log('✅ Default admin settings created');
    }
  } catch (error) {
    console.error('Error inserting default data:', error);
  }
}

// Get database connection (PostgreSQL with SQLite-compatible interface)
function getDB() {
  return {
    // Prepare statement equivalent for PostgreSQL
    prepare: (query) => ({
      all: async (...params) => {
        try {
          // Convert SQLite-style placeholders to PostgreSQL
          let pgQuery = query;
          params.forEach((param, index) => {
            pgQuery = pgQuery.replace('?', `$${index + 1}`);
          });

          const result = await sql.query(pgQuery, params);
          return result.rows;
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      get: async (...params) => {
        try {
          // Convert SQLite-style placeholders to PostgreSQL
          let pgQuery = query;
          params.forEach((param, index) => {
            pgQuery = pgQuery.replace('?', `$${index + 1}`);
          });

          const result = await sql.query(pgQuery, params);
          return result.rows[0];
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      run: async (...params) => {
        try {
          // Convert SQLite-style placeholders to PostgreSQL
          let pgQuery = query;
          params.forEach((param, index) => {
            pgQuery = pgQuery.replace('?', `$${index + 1}`);
          });

          const result = await sql.query(pgQuery, params);
          return {
            changes: result.rowCount || 0,
            lastInsertRowid: result.rows[0]?.id || null
          };
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
  sql
};
