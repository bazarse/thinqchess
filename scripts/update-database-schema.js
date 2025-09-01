const { getDB } = require('../lib/database.js');

async function updateDatabaseSchema() {
  console.log('🔧 Updating database schema...');
  
  try {
    const db = getDB();
    
    // Add payment_settings column if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE admin_settings 
        ADD COLUMN payment_settings TEXT DEFAULT '{"payment_mode": "razorpay", "razorpay_key_id": "rzp_live_z71oXRZ0avccLv", "razorpay_key_secret": "uNuvlB1ovlLeGTUmyBQi6qPU", "test_mode": false}'
      `).run();
      console.log('✅ Added payment_settings column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ payment_settings column already exists');
      } else {
        console.error('❌ Error adding payment_settings column:', e.message);
      }
    }
    
    // Add google_settings column if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE admin_settings 
        ADD COLUMN google_settings TEXT DEFAULT '{"places_api_key": "", "place_id_jp_nagar": "ChXdvpvpgI0jaOm_lM-Zf9XXYjM", "place_id_akshayanagar": "", "reviews_enabled": true}'
      `).run();
      console.log('✅ Added google_settings column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ google_settings column already exists');
      } else {
        console.error('❌ Error adding google_settings column:', e.message);
      }
    }
    
    // Add tournament_id column to tournament_registrations if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE tournament_registrations 
        ADD COLUMN tournament_id INTEGER
      `).run();
      console.log('✅ Added tournament_id column to tournament_registrations');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ tournament_id column already exists in tournament_registrations');
      } else {
        console.error('❌ Error adding tournament_id column:', e.message);
      }
    }
    
    // Add participant_middle_name column if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE tournament_registrations 
        ADD COLUMN participant_middle_name TEXT
      `).run();
      console.log('✅ Added participant_middle_name column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ participant_middle_name column already exists');
      } else {
        console.error('❌ Error adding participant_middle_name column:', e.message);
      }
    }
    
    // Add age column if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE tournament_registrations 
        ADD COLUMN age INTEGER
      `).run();
      console.log('✅ Added age column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ age column already exists');
      } else {
        console.error('❌ Error adding age column:', e.message);
      }
    }
    
    // Add fide_id column if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE tournament_registrations 
        ADD COLUMN fide_id TEXT
      `).run();
      console.log('✅ Added fide_id column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ fide_id column already exists');
      } else {
        console.error('❌ Error adding fide_id column:', e.message);
      }
    }
    
    // Add country_code column if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE tournament_registrations 
        ADD COLUMN country_code TEXT
      `).run();
      console.log('✅ Added country_code column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ country_code column already exists');
      } else {
        console.error('❌ Error adding country_code column:', e.message);
      }
    }
    
    // Add type column if it doesn't exist
    try {
      db.prepare(`
        ALTER TABLE tournament_registrations 
        ADD COLUMN type TEXT DEFAULT 'tournament'
      `).run();
      console.log('✅ Added type column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('ℹ️ type column already exists');
      } else {
        console.error('❌ Error adding type column:', e.message);
      }
    }
    
    // Create tournaments table if it doesn't exist
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS tournaments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT,
          end_date TEXT,
          registration_start_date TEXT,
          registration_end_date TEXT,
          flyer_image TEXT,
          is_active INTEGER DEFAULT 0,
          categories TEXT DEFAULT '[]',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      console.log('✅ Created tournaments table');
    } catch (e) {
      console.error('❌ Error creating tournaments table:', e.message);
    }
    
    // Create gallery_images table if it doesn't exist
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS gallery_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image_name TEXT,
          image_url TEXT NOT NULL,
          display_order INTEGER DEFAULT 0,
          category TEXT DEFAULT 'uncategorized',
          type TEXT DEFAULT 'image',
          youtube_id TEXT,
          youtube_url TEXT,
          title TEXT,
          uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      console.log('✅ Created gallery_images table');
    } catch (e) {
      console.error('❌ Error creating gallery_images table:', e.message);
    }
    
    // Create blogs table if it doesn't exist
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS blogs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE,
          content TEXT,
          featured_image TEXT,
          status TEXT DEFAULT 'draft',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      console.log('✅ Created blogs table');
    } catch (e) {
      console.error('❌ Error creating blogs table:', e.message);
    }
    
    // Create demo_requests table if it doesn't exist
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS demo_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parent_name TEXT,
          child_name TEXT,
          email TEXT,
          phone TEXT,
          age INTEGER,
          message TEXT,
          status TEXT DEFAULT 'pending',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      console.log('✅ Created demo_requests table');
    } catch (e) {
      console.error('❌ Error creating demo_requests table:', e.message);
    }
    
    console.log('🎉 Database schema update completed successfully!');
    
  } catch (error) {
    console.error('💥 Error updating database schema:', error);
    process.exit(1);
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateDatabaseSchema();
}

module.exports = { updateDatabaseSchema };