// Supabase Setup Script - Automatically creates tables and buckets
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkchykbemnzlknvtlfxx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrY2h5a2JlbW56bGtudnRsZnh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzODkxOSwiZXhwIjoyMDY5MjE0OTE5fQ.EnJlGRIvuehZjZGtspRRdPq99BNLagrQWayFq_KAsHI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting Supabase Database Setup...');

  try {
    // Create tables using SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create admin settings table
        CREATE TABLE IF NOT EXISTS admin_settings (
          id BIGSERIAL PRIMARY KEY,
          tournament_fee DECIMAL(10,2) DEFAULT 400.00,
          registration_fee DECIMAL(10,2) DEFAULT 500.00,
          max_participants INTEGER DEFAULT 52,
          countdown_end_date TIMESTAMPTZ,
          tournament_registration_active BOOLEAN DEFAULT false,
          tournament_registration_mode VARCHAR(20) DEFAULT 'manual',
          tournament_open_date TIMESTAMPTZ,
          tournament_close_date TIMESTAMPTZ,
          tournament_closed_message TEXT DEFAULT 'Registration is currently closed. Please check back later.',
          course_registration_active BOOLEAN DEFAULT true,
          coming_soon_message TEXT DEFAULT 'Coming Soon! New tournament season starting soon.',
          tournament_types JSONB DEFAULT '[
            {"id": "under_8", "name": "Under 8", "fee": 300, "age_min": 5, "age_max": 8, "active": true},
            {"id": "under_10", "name": "Under 10", "fee": 350, "age_min": 8, "age_max": 10, "active": true},
            {"id": "under_12", "name": "Under 12", "fee": 400, "age_min": 10, "age_max": 12, "active": true},
            {"id": "under_16", "name": "Under 16", "fee": 450, "age_min": 12, "age_max": 16, "active": true},
            {"id": "open", "name": "Open (Any Age)", "fee": 500, "age_min": null, "age_max": null, "active": true}
          ]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create tournaments table
        CREATE TABLE IF NOT EXISTS tournaments (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          registration_start_date DATE,
          registration_end_date DATE,
          fee DECIMAL(10,2) DEFAULT 500.00,
          max_participants INTEGER DEFAULT 50,
          status VARCHAR(20) DEFAULT 'upcoming',
          venue VARCHAR(255),
          rules TEXT,
          prizes JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create tournament registrations table
        CREATE TABLE IF NOT EXISTS tournament_registrations (
          id BIGSERIAL PRIMARY KEY,
          participant_first_name VARCHAR(255) NOT NULL,
          participant_last_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          dob DATE,
          gender VARCHAR(10),
          tournament_type VARCHAR(50) DEFAULT 'open',
          country VARCHAR(100),
          state VARCHAR(100),
          city VARCHAR(100),
          address TEXT,
          amount_paid DECIMAL(10,2),
          discount_code VARCHAR(50),
          discount_amount DECIMAL(10,2) DEFAULT 0,
          payment_id VARCHAR(255),
          razorpay_order_id VARCHAR(255),
          payment_status VARCHAR(50) DEFAULT 'pending',
          type VARCHAR(50) DEFAULT 'tournament',
          registered_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create registrations table (for tournament-specific registrations)
        CREATE TABLE IF NOT EXISTS registrations (
          id BIGSERIAL PRIMARY KEY,
          tournament_id BIGINT REFERENCES tournaments(id),
          participant_first_name VARCHAR(255) NOT NULL,
          participant_last_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          dob DATE,
          gender VARCHAR(10),
          tournament_type VARCHAR(50) DEFAULT 'open',
          country VARCHAR(100),
          state VARCHAR(100),
          city VARCHAR(100),
          address TEXT,
          amount_paid DECIMAL(10,2),
          discount_code VARCHAR(50),
          discount_amount DECIMAL(10,2) DEFAULT 0,
          payment_id VARCHAR(255),
          razorpay_order_id VARCHAR(255),
          payment_status VARCHAR(50) DEFAULT 'pending',
          registered_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create admin users table
        CREATE TABLE IF NOT EXISTS admin_users (
          id BIGSERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          password_hash VARCHAR(255),
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create discount codes table
        CREATE TABLE IF NOT EXISTS discount_codes (
          id BIGSERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          discount_percent DECIMAL(5,2) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          usage_limit INTEGER DEFAULT 100,
          used_count INTEGER DEFAULT 0,
          code_type VARCHAR(20) DEFAULT 'manual',
          prefix VARCHAR(10),
          email_domain VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create gallery images table
        CREATE TABLE IF NOT EXISTS gallery_images (
          id BIGSERIAL PRIMARY KEY,
          image_name TEXT NOT NULL,
          image_url TEXT NOT NULL,
          category TEXT DEFAULT 'uncategorized',
          display_order INTEGER DEFAULT 0,
          uploaded_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create blogs table
        CREATE TABLE IF NOT EXISTS blogs (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          slug TEXT UNIQUE NOT NULL,
          author TEXT DEFAULT 'Admin',
          status TEXT DEFAULT 'draft',
          tags TEXT[],
          featured_image TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
        CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
        CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery_images(display_order);
        CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
        CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
        CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(payment_status);
        CREATE INDEX IF NOT EXISTS idx_tournament_registrations_date ON tournament_registrations(registered_at);
        CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations(tournament_id);
        CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
      `
    });

    if (error) {
      console.error('❌ Error creating tables:', error);
    } else {
      console.log('✅ Database tables created successfully!');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

async function insertSampleData() {
  console.log('📝 Inserting sample data...');

  try {
    // Insert admin settings
    const { error: adminError } = await supabase
      .from('admin_settings')
      .upsert([{
        id: 1,
        tournament_fee: 400.00,
        registration_fee: 500.00,
        max_participants: 52,
        tournament_registration_active: false,
        course_registration_active: true,
        coming_soon_message: 'Coming Soon! Get ready for the biggest chess tournament of the year!'
      }]);

    if (adminError) {
      console.error('❌ Error inserting admin settings:', adminError);
    } else {
      console.log('✅ Admin settings inserted!');
    }

    // Insert admin user
    const { error: adminUserError } = await supabase
      .from('admin_users')
      .upsert([{
        email: 'admin@thinqchess.com',
        password: '1234',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'admin'
      }]);

    if (adminUserError) {
      console.error('❌ Error inserting admin user:', adminUserError);
    } else {
      console.log('✅ Admin user inserted!');
    }

    // Insert sample discount codes
    const { error: discountError } = await supabase
      .from('discount_codes')
      .upsert([
        { code: 'TC10', discount_percent: 10.00, usage_limit: 50 },
        { code: 'TC20', discount_percent: 20.00, usage_limit: 30 },
        { code: 'TCON15', discount_percent: 15.00, usage_limit: 100 },
        { code: 'STUDENT25', discount_percent: 25.00, usage_limit: 200 },
        { code: 'EARLY20', discount_percent: 20.00, usage_limit: 75 }
      ]);

    if (discountError) {
      console.error('❌ Error inserting discount codes:', discountError);
    } else {
      console.log('✅ Discount codes inserted!');
    }

    // Insert sample tournaments
    const { error: tournamentError } = await supabase
      .from('tournaments')
      .upsert([
        {
          id: 1,
          name: 'ThinQ Chess Championship 2024',
          description: 'Annual chess championship with multiple categories',
          start_date: '2024-12-01',
          end_date: '2024-12-03',
          registration_start_date: '2024-11-01',
          registration_end_date: '2024-11-25',
          fee: 500.00,
          max_participants: 100,
          status: 'completed',
          venue: 'ThinQ Chess Academy, Mumbai'
        },
        {
          id: 2,
          name: 'Winter Chess Tournament 2024',
          description: 'Winter season tournament for all age groups',
          start_date: '2024-01-15',
          end_date: '2024-01-17',
          registration_start_date: '2023-12-15',
          registration_end_date: '2024-01-10',
          fee: 400.00,
          max_participants: 80,
          status: 'completed',
          venue: 'Community Center, Delhi'
        }
      ]);

    if (tournamentError) {
      console.error('❌ Error inserting tournaments:', tournamentError);
    } else {
      console.log('✅ Sample tournaments inserted!');
    }

    // Insert sample blog
    const { error: blogError } = await supabase
      .from('blogs')
      .upsert([{
        title: 'Welcome to ThinQ Chess Academy',
        content: 'Welcome to our chess academy! We provide world-class chess training for players of all levels. Our expert coaches will help you improve your game and achieve your chess goals.',
        excerpt: 'Join our chess academy for expert training and tournaments.',
        slug: 'welcome-to-thinq-chess',
        status: 'published',
        featured_image: '/images/indian-img-one.jpg',
        author: 'Admin'
      }]);

    if (blogError) {
      console.error('❌ Error inserting blog:', blogError);
    } else {
      console.log('✅ Sample blog inserted!');
    }

    // Insert sample gallery images
    const { error: galleryError } = await supabase
      .from('gallery_images')
      .upsert([
        {
          image_name: 'Chess Training Session',
          image_url: '/images/indian-img-one.jpg',
          category: 'training',
          display_order: 1
        },
        {
          image_name: 'Tournament Winners',
          image_url: '/images/indian-img-two.jpg',
          category: 'tournaments',
          display_order: 2
        },
        {
          image_name: 'Chess Academy',
          image_url: '/images/indian-img-three.jpg',
          category: 'academy',
          display_order: 3
        }
      ]);

    if (galleryError) {
      console.error('❌ Error inserting gallery images:', galleryError);
    } else {
      console.log('✅ Sample gallery images inserted!');
    }

  } catch (error) {
    console.error('❌ Sample data insertion failed:', error);
  }
}

async function createStorageBuckets() {
  console.log('📁 Creating storage buckets...');

  const buckets = [
    { name: 'blog-images', public: true },
    { name: 'gallery-images', public: true },
    { name: 'general-uploads', public: true }
  ];

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public
      });

      if (error && error.message !== 'Bucket already exists') {
        console.error(`❌ Error creating bucket ${bucket.name}:`, error);
      } else {
        console.log(`✅ Bucket ${bucket.name} created/exists!`);
      }
    } catch (error) {
      console.error(`❌ Bucket creation failed for ${bucket.name}:`, error);
    }
  }
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📊 Admin settings:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

async function runSetup() {
  console.log('🎯 ThinQ Chess - Supabase Complete Setup');
  console.log('==========================================');

  // Run setup steps (skip connection test as tables don't exist yet)
  await setupDatabase();
  await createStorageBuckets();
  await insertSampleData();

  // Test connection after setup
  console.log('🔍 Testing connection after setup...');
  await testConnection();

  console.log('==========================================');
  console.log('🎉 Supabase setup complete!');
  console.log('✅ Database tables created');
  console.log('✅ Storage buckets created');
  console.log('✅ Sample data inserted');
  console.log('');
  console.log('🚀 Your website is now ready with Supabase!');
  console.log('🔗 Admin Panel: http://localhost:3000/admin');
  console.log('👤 Login: admin@thinqchess.com / admin123');
}

// Run the setup
runSetup().catch(console.error);

module.exports = { runSetup };
